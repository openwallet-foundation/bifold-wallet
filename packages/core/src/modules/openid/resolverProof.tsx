import { Agent, DifPexCredentialsForRequest, Jwt, X509ModuleConfig } from '@credo-ts/core'
import { ParseInvitationResult } from '../../utils/parsers'
import q from 'query-string'
import { OpenId4VPRequestRecord } from './types'
import { getHostNameFromUrl } from './utils/utils'
import { OpenId4VcApi, OpenId4VpAuthorizationRequestPayload } from '@credo-ts/openid4vc'
import { Linking } from 'react-native'
import Config from 'react-native-config'

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

const extractCertificateFromJwt = (jwt: string) => {
  const jwtHeader = Jwt.fromSerializedJwt(jwt).header
  return Array.isArray(jwtHeader.x5c) && typeof jwtHeader.x5c[0] === 'string' ? jwtHeader.x5c[0] : null
}

/**
 * This is a temp method to allow for untrusted certificates to still work with the wallet.
 */
export const extractCertificateFromAuthorizationRequest = async ({
  data,
  uri,
}: {
  data?: string
  uri?: string
}): Promise<{ data: string | null; certificate: string | null }> => {
  try {
    if (data) {
      return {
        data,
        certificate: extractCertificateFromJwt(data),
      }
    }

    if (uri) {
      const query = q.parseUrl(uri).query
      if (query.request_uri && typeof query.request_uri === 'string') {
        const result = await fetchInvitationDataUrl(query.request_uri)
        if (
          result.success &&
          result.result.type === 'openid-authorization-request' &&
          typeof result.result.data === 'string'
        ) {
          return {
            data: result.result.data,
            certificate: extractCertificateFromJwt(result.result.data),
          }
        }
      } else if (query.request && typeof query.request === 'string') {
        const _res = {
          data: query.request,
          certificate: extractCertificateFromJwt(query.request),
        }
        return _res
      }
    }
    return { data: null, certificate: null }
  } catch (error) {
    return { data: null, certificate: null }
  }
}

export async function withTrustedCertificate<T>(
  agent: Agent, //This should maybe be AgentContext instead
  certificate: string | null,
  method: () => Promise<T> | T
): Promise<T> {
  const x509ModuleConfig = agent.modules.dependencyManager.resolve(X509ModuleConfig)
  const currentTrustedCertificates = x509ModuleConfig.trustedCertificates
    ? [...x509ModuleConfig.trustedCertificates]
    : []

  try {
    if (certificate) agent.modules.x509.addTrustedCertificate(certificate)
    return await method()
  } finally {
    if (certificate) x509ModuleConfig.setTrustedCertificates(currentTrustedCertificates as [string])
  }
}

//This settings should be moved to an injectable config
const allowUntrustedCertificates = false

export const getCredentialsForProofRequest = async ({
  agent,
  data,
  uri,
}: {
  agent: Agent
  // Either data itself (the offer) or uri can be passed
  data?: string
  uri?: string
  fetchAuthorization?: boolean
  authorization?: { clientId: string; redirectUri: string }
}): Promise<OpenId4VPRequestRecord | undefined> => {
  let requestUri = uri

  try {
    const { certificate = null, data: newData = null } = allowUntrustedCertificates
      ? await extractCertificateFromAuthorizationRequest({ data, uri })
      : {}

    if (newData) {
      // FIXME: Credo only support request string, but we already parsed it before. So we construct an request here
      // but in the future we need to support the parsed request in Credo directly
      requestUri = `openid://?request=${encodeURIComponent(newData)}`
    } else if (uri) {
      requestUri = uri
    } else {
      throw new Error('Either data or uri must be provided')
    }

    agent.config.logger.info(`$$Receiving openid uri ${requestUri}`)

    const resolved = await (agent.modules.openid4vc as OpenId4VcApi).holder.resolveOpenId4VpAuthorizationRequest(requestUri as string)

    if (!resolved.presentationExchange && !resolved.dcql) {
      throw new Error('No presentation exchange or DCQL found in authorization request.')
    }

    let dcqlCredentialsForRequest;
    if (resolved.dcql?.queryResult) {
      dcqlCredentialsForRequest = (agent.modules.openid4vc as OpenId4VcApi).holder.selectCredentialsForDcqlRequest(
        resolved.dcql.queryResult
      )
    }
    
    const requestRecord: OpenId4VPRequestRecord = {
      ...resolved,
      definition: resolved.presentationExchange?.definition,
      credentialsForRequest: resolved.presentationExchange?.credentialsForRequest,
      dcqlCredentialsForRequest: dcqlCredentialsForRequest,
      authorizationRequestPayload: resolved.authorizationRequestPayload,
      verifierHostName: resolved.authorizationRequestPayload.response_uri
        ? getHostNameFromUrl(resolved.authorizationRequestPayload.response_uri as string)
        : undefined,
      createdAt: new Date(),
      type: 'OpenId4VPRequestRecord',
    }

    return requestRecord;
  } catch (err) {
    agent.config.logger.error(`Parsing presentation request:  ${(err as Error)?.message ?? err}`)
    throw err
  }
}

export const shareProof = async ({
  agent,
  requestRecord,
  authorizationRequest,
  credentialsForRequest,
  selectedCredentials,
  allowUntrustedCertificate = false,
}: {
  agent: Agent
  requestRecord: OpenId4VPRequestRecord
  authorizationRequest: OpenId4VpAuthorizationRequestPayload
  credentialsForRequest: DifPexCredentialsForRequest | undefined
  selectedCredentials: { [inputDescriptorId: string]: { id: string; claimFormat: string } }
  allowUntrustedCertificate?: boolean
}) => {
  // if (!credentialsForRequest.areRequirementsSatisfied) {
  //   throw new Error('Requirements from proof request are not satisfied')
  // }

  // Map all requirements and entries to a credential record. If a credential record for an
  // input descriptor has been provided in `selectedCredentials` we will use that. Otherwise
  // it will pick the first available credential.
  // const credentials = Object.fromEntries(
  //   credentialsForRequest.requirements.flatMap((requirement) =>
  //     requirement.submissionEntry.map((entry) => {
  //       const credentialId = selectedCredentials[entry.inputDescriptorId].id
  //       const credential =
  //         entry.verifiableCredentials.find((vc) => vc.credentialRecord.id === credentialId) ??
  //         entry.verifiableCredentials[0]

  //       return [entry.inputDescriptorId, [credential.credentialRecord]]
  //     })
  //   )
  // )

  try {
    // FORK TODO: Clean up all this stuff
    // Temp solution to add and remove the trusted certicaite
    // const certificate =
    //   authorizationRequest.jwt && allowUntrustedCertificate ? extractCertificateFromJwt(authorizationRequest) : null

    // Need to figure out how to include this certificate, does not seem like the JWT is included in the authorizationRequest any more.
    if (Config.ISSUER_CERT_B64) {
      agent.x509.config.setTrustedCertificates([Config.ISSUER_CERT_B64])
    }
    
    // is withTrustedCertificate needed here?
    const result = await (agent.openid4vc as OpenId4VcApi).holder.acceptOpenId4VpAuthorizationRequest({
      authorizationRequestPayload: authorizationRequest,
      presentationExchange: requestRecord.presentationExchange ? {
        credentials: (agent.openid4vc as OpenId4VcApi).holder.selectCredentialsForPresentationExchangeRequest(
          requestRecord.presentationExchange?.credentialsForRequest
        ),
      } : undefined,
      dcql: requestRecord.dcql ? {
        credentials: (agent.openid4vc as OpenId4VcApi).holder.selectCredentialsForDcqlRequest(
          requestRecord.dcql.queryResult
        )
      } : undefined
    })

    // if redirect_uri is provided, open it in the browser
    // Even if the response returned an error, we must open this uri
    if (typeof result.redirectUri === 'string') {
      await Linking.openURL(result.redirectUri)
    }

    if (result.serverResponse == null || result.serverResponse.status < 200 || result.serverResponse.status > 299) {
      throw new Error(`Error while accepting authorization request. ${result.serverResponse?.body as string}`)
    }

    return result
  } catch (error) {
    // Handle biometric authentication errors
    throw new Error(`Error accepting proof request. ${(error as Error)?.message ?? error}`)
  }
}
