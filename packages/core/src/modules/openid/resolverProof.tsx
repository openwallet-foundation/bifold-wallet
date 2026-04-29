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
import { ParseInvitationResult } from '../../utils/parsers'
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

function handleTextResponse(text: string): ParseInvitationResult {
  // If the text starts with 'ey' we assume it's a JWT and thus an OpenID authorization request
  if (text.startsWith('ey')) {
    return {
      success: true,
      result: {
        format: 'parsed',
        type: 'openid-authorization-request',
        data: text,
      },
    }
  }

  // Otherwise we still try to parse it as JSON
  try {
    const json: unknown = JSON.parse(text)
    return handleJsonResponse(json)

    // handel like above
  } catch (error) {
    throw new Error(`[handleTextResponse] Error:${error}`)
  }
}

function handleJsonResponse(json: unknown): ParseInvitationResult {
  // We expect a JSON object
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error('[handleJsonResponse] Invitation not recognized.')
  }

  if ('@type' in json) {
    return {
      success: true,
      result: {
        format: 'parsed',
        type: 'didcomm',
        data: json,
      },
    }
  }

  if ('credential_issuer' in json) {
    return {
      success: true,
      result: {
        format: 'parsed',
        type: 'openid-credential-offer',
        data: json,
      },
    }
  }

  throw new Error('[handleJsonResponse] Invitation not recognized.')
}

export async function fetchInvitationDataUrl(dataUrl: string): Promise<ParseInvitationResult> {
  // If we haven't had a response after 10 seconds, we will handle as if the invitation is not valid.
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), 10000)

  try {
    // If we still don't know what type of invitation it is, we assume it is a URL that we need to fetch to retrieve the invitation.
    const response = await fetch(dataUrl, {
      headers: {
        // for DIDComm out of band invitations we should include application/json
        // but we are flexible and also want to support other types of invitations
        // as e.g. the OpenID SIOP request is a signed encoded JWT string
        Accept: 'application/json, text/plain, */*',
      },
    })
    clearTimeout(timeout)
    if (!response.ok) {
      throw new Error('[retrieve_invitation_error] Unable to retrieve invitation.')
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const json: unknown = await response.json()
      return handleJsonResponse(json)
    }
    const text = await response.text()
    return handleTextResponse(text)
  } catch (error) {
    clearTimeout(timeout)
    throw new Error(`[retrieve_invitation_error] Unable to retrieve invitation: ${error}`)
  }
}

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
