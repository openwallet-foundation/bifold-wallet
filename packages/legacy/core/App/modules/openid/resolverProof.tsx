import { Agent, DifPexCredentialsForRequest, Jwt, X509ModuleConfig } from '@credo-ts/core'
import { OpenID4VCIParam } from './resolver'
import { ParseInvitationResult } from '../../utils/parsers'
import q from 'query-string'
import { OpenId4VPRequestRecord } from './types'
import { getHostNameFromUrl } from './utils/utils'
import { OpenId4VcSiopVerifiedAuthorizationRequest } from '@credo-ts/openid4vc'
import { Linking } from 'react-native'

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
  agent: Agent,
  certificate: string | null,
  method: () => Promise<T> | T
): Promise<T> {
  const x509ModuleConfig = agent.dependencyManager.resolve(X509ModuleConfig)
  const currentTrustedCertificates = x509ModuleConfig.trustedCertificates
    ? [...x509ModuleConfig.trustedCertificates]
    : []

  try {
    if (certificate) agent.x509.addTrustedCertificate(certificate)
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
}: OpenID4VCIParam): Promise<OpenId4VPRequestRecord | undefined> => {
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

    // Temp solution to add and remove the trusted certificate
    const resolved = await withTrustedCertificate(agent, certificate, () => {
      return agent.modules.openId4VcHolder.resolveSiopAuthorizationRequest(requestUri)
    })

    if (!resolved.presentationExchange) {
      throw new Error('No presentation exchange found in authorization request.')
    }
    return {
      ...resolved.presentationExchange,
      authorizationRequest: resolved.authorizationRequest,
      verifierHostName: resolved.authorizationRequest.responseURI
        ? getHostNameFromUrl(resolved.authorizationRequest.responseURI)
        : undefined,
      createdAt: new Date(),
      type: 'OpenId4VPRequestRecord',
    }
  } catch (err) {
    agent.config.logger.error(`Parsing presentation request:  ${(err as Error)?.message ?? err}`)
    throw err
  }
}

export const shareProof = async ({
  agent,
  authorizationRequest,
  credentialsForRequest,
  selectedCredentials,
  allowUntrustedCertificate = false,
}: {
  agent: Agent
  authorizationRequest: OpenId4VcSiopVerifiedAuthorizationRequest
  credentialsForRequest: DifPexCredentialsForRequest
  selectedCredentials: { [inputDescriptorId: string]: string }
  allowUntrustedCertificate?: boolean
}) => {
  if (!credentialsForRequest.areRequirementsSatisfied) {
    throw new Error('Requirements from proof request are not satisfied')
  }

  // Map all requirements and entries to a credential record. If a credential record for an
  // input descriptor has been provided in `selectedCredentials` we will use that. Otherwise
  // it will pick the first available credential.
  const credentials = Object.fromEntries(
    credentialsForRequest.requirements.flatMap((requirement) =>
      requirement.submissionEntry.map((entry) => {
        const credentialId = selectedCredentials[entry.inputDescriptorId]
        const credential =
          entry.verifiableCredentials.find((vc) => vc.credentialRecord.id === credentialId) ??
          entry.verifiableCredentials[0]

        return [entry.inputDescriptorId, [credential.credentialRecord]]
      })
    )
  )

  try {
    // Temp solution to add and remove the trusted certicaite
    const certificate =
      authorizationRequest.jwt && allowUntrustedCertificate ? extractCertificateFromJwt(authorizationRequest.jwt) : null

    const result = await withTrustedCertificate(agent, certificate, () =>
      agent.modules.openId4VcHolder.acceptSiopAuthorizationRequest({
        authorizationRequest,
        presentationExchange: {
          credentials,
        },
      })
    )

    // if redirect_uri is provided, open it in the browser
    // Even if the response returned an error, we must open this uri
    if (typeof result.serverResponse.body === 'object' && typeof result.serverResponse.body.redirect_uri === 'string') {
      await Linking.openURL(result.serverResponse.body.redirect_uri)
    }

    if (result.serverResponse.status < 200 || result.serverResponse.status > 299) {
      throw new Error(`Error while accepting authorization request. ${result.serverResponse.body as string}`)
    }

    return result
  } catch (error) {
    // Handle biometric authentication errors
    throw new Error(`Error accepting proof request. ${(error as Error)?.message ?? error}`)
  }
}
