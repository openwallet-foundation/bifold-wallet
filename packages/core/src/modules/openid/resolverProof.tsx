import {
  Agent,
  ClaimFormat,
  CredentialMultiInstanceUseMode,
  type DcqlCredentialsForRequest,
  type DcqlQueryResult,
  type DcqlValidCredential,
  type DifPexCredentialsForRequest,
  type JsonObject,
  type MdocNameSpaces,
} from '@credo-ts/core'
import { OpenId4VPRequestRecord } from './types'
import { getHostNameFromUrl } from './utils/utils'
import { Linking } from 'react-native'
import { BifoldAgent } from '../../utils/agent'

type SelectedProofCredentials = Record<
  string,
  {
    id: string
    claimFormat: string
  }
>

/**
 * Entry point for the OpenID4VP flow after QR scanning / deeplink / paste handling
 * has identified an OpenID authorization request.
 *
 * This is the resolve phase only:
 * - accept the raw request string coming from scan/deeplink handling
 * - ask Credo to resolve the request into PEX or DCQL details
 * - return a record that the proof UI can render
 *
 * It does not send anything to the verifier. The later submit phase is handled by
 * {@link shareProof}, after the user explicitly opts in to share credentials.
 */
export const getCredentialsForProofRequest = async ({
  agent,
  request,
}: {
  agent: BifoldAgent
  request: string
}): Promise<OpenId4VPRequestRecord | undefined> => {
  try {
    agent.config.logger.info(`$$Receiving openid authorization request ${request}`)

    const resolved = await agent.modules.openid4vc.holder.resolveOpenId4VpAuthorizationRequest(request)

    if (!resolved.presentationExchange && !resolved.dcql) {
      throw new Error('Unsupported authorization request: missing presentation exchange or dcql parameters.')
    }

    const requestRecord: OpenId4VPRequestRecord = {
      ...resolved,
      verifierHostName: resolved.authorizationRequestPayload.response_uri
        ? getHostNameFromUrl(String(resolved.authorizationRequestPayload.response_uri))
        : undefined,
      createdAt: new Date(),
      type: 'OpenId4VPRequestRecord',
    }
    return requestRecord
  } catch (err) {
    agent.config.logger.error(`Parsing presentation request:  ${(err as Error)?.message ?? err}`)
    throw err
  }
}

const getPexCredentialsForRequest = (
  credentialsForRequest: DifPexCredentialsForRequest,
  selectedProofCredentials: SelectedProofCredentials
) => {
  if (!credentialsForRequest.areRequirementsSatisfied) {
    throw new Error('Requirements from proof request are not satisfied')
  }

  // `selectedProofCredentials` always represents the user's final UI choice.
  // For PEX, the map key is the input descriptor id.
  return Object.fromEntries(
    credentialsForRequest.requirements.flatMap((requirement) =>
      requirement.submissionEntry.map((entry) => {
        const credentialId = selectedProofCredentials[entry.inputDescriptorId].id
        const credential =
          entry.verifiableCredentials.find((vc) => vc.credentialRecord.id === credentialId) ??
          entry.verifiableCredentials[0]

        return [entry.inputDescriptorId, [credential]]
      })
    )
  )
}

const getDcqlCredentialForRequest = (
  validCredential: DcqlValidCredential
): DcqlCredentialsForRequest[string][number] => {
  const useMode = CredentialMultiInstanceUseMode.NewOrFirst

  switch (validCredential.record.type) {
    case 'MdocRecord':
      return {
        claimFormat: ClaimFormat.MsoMdoc,
        credentialRecord: validCredential.record,
        disclosedPayload: validCredential.claims.valid_claim_sets[0].output as MdocNameSpaces,
        useMode,
      }
    case 'SdJwtVcRecord':
      return {
        claimFormat: ClaimFormat.SdJwtDc,
        credentialRecord: validCredential.record,
        disclosedPayload: validCredential.claims.valid_claim_sets[0].output as JsonObject,
        useMode,
      }
    case 'W3cCredentialRecord':
      return {
        claimFormat: validCredential.record.firstCredential.claimFormat as ClaimFormat.JwtVc | ClaimFormat.LdpVc,
        credentialRecord: validCredential.record,
        disclosedPayload: validCredential.record.firstCredential.jsonCredential as JsonObject,
        useMode,
      }
    case 'W3cV2CredentialRecord':
      return {
        claimFormat: validCredential.record.firstCredential.claimFormat as
          | ClaimFormat.JwtW3cVc
          | ClaimFormat.SdJwtW3cVc,
        credentialRecord: validCredential.record,
        disclosedPayload: validCredential.claims.valid_claim_sets[0].output as JsonObject,
        useMode,
      }
  }
}

const getDcqlCredentialsForRequest = (
  agent: Agent,
  queryResult: DcqlQueryResult,
  selectedProofCredentials: SelectedProofCredentials
): DcqlCredentialsForRequest => {
  if (!queryResult.can_be_satisfied) {
    throw new Error('Cannot select the credentials for the dcql query presentation if the request cannot be satisfied')
  }

  // This is the same user-selection map as for PEX.
  // For DCQL, the map key is the credential query id instead of the input descriptor id.
  if (Object.keys(selectedProofCredentials).length === 0) {
    return agent.openid4vc.holder.selectCredentialsForDcqlRequest(queryResult)
  }

  return Object.fromEntries(
    Object.entries(selectedProofCredentials).map(([credentialQueryId, selectedCredential]) => {
      const match = queryResult.credential_matches[credentialQueryId]

      if (!match?.success) {
        throw new Error(`No matching DCQL credentials found for credential query id ${credentialQueryId}`)
      }

      const validCredentials = Array.from(match.valid_credentials) as DcqlValidCredential[]
      const validCredential = validCredentials.find((credential) => credential.record.id === selectedCredential.id)

      if (!validCredential) {
        throw new Error(
          `Could not find credential record ${selectedCredential.id} in valid credential matches for credential query id ${credentialQueryId}`
        )
      }

      return [credentialQueryId, [getDcqlCredentialForRequest(validCredential)]]
    })
  )
}

/**
 * Submit phase for OpenID4VP after the user has reviewed the request and chosen
 * which credentials to share.
 *
 * This function takes:
 * - the resolved request record created by {@link getCredentialsForProofRequest}
 * - the user's final credential selections from the proof UI
 *
 * It then maps those selections into the Credo input expected for either
 * presentation exchange or DCQL and submits the authorization response.
 */
export const shareProof = async ({
  agent,
  requestRecord,
  selectedProofCredentials,
}: {
  agent: Agent
  requestRecord: OpenId4VPRequestRecord
  selectedProofCredentials: SelectedProofCredentials
}) => {
  try {
    const presentationExchange = requestRecord.presentationExchange
      ? {
          credentials: getPexCredentialsForRequest(
            requestRecord.presentationExchange.credentialsForRequest,
            selectedProofCredentials
          ),
        }
      : undefined

    const dcql =
      !presentationExchange && requestRecord.dcql
        ? {
            credentials: getDcqlCredentialsForRequest(agent, requestRecord.dcql.queryResult, selectedProofCredentials),
          }
        : undefined

    if (!presentationExchange && !dcql) {
      throw new Error('Unsupported authorization request: missing presentation exchange or dcql parameters.')
    }

    const result = await agent.openid4vc.holder.acceptOpenId4VpAuthorizationRequest({
      authorizationRequestPayload: requestRecord.authorizationRequestPayload,
      presentationExchange,
      dcql,
      origin: requestRecord.origin,
    })

    // if redirect_uri is provided, open it in the browser
    // Even if the response returned an error, we must open this uri
    if (
      result.serverResponse &&
      typeof result.serverResponse.body === 'object' &&
      typeof result.serverResponse.body?.redirect_uri === 'string'
    ) {
      await Linking.openURL(result.serverResponse.body.redirect_uri)
    }

    if (result.serverResponse && (result.serverResponse.status < 200 || result.serverResponse.status > 299)) {
      throw new Error(`Error while accepting authorization request. ${result.serverResponse.body as string}`)
    }

    return result
  } catch (error) {
    // Handle biometric authentication errors
    throw new Error(`Error accepting proof request. ${(error as Error)?.message ?? error}`)
  }
}
