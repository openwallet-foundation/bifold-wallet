import { Agent, Jwt, X509ModuleConfig } from '@credo-ts/core'
import { OpenID4VCIParam } from './resolver'
import { ParseInvitationResult } from '../../utils/parsers'
import q from 'query-string'

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

      console.log('$$[extractCertificateFromAuthorizationRequest][query]:', query)

      if (query.request_uri && typeof query.request_uri === 'string') {
        const result = await fetchInvitationDataUrl(query.request_uri)

        console.log('$$[extractCertificateFromAuthorizationRequest][fetchInvitationDataUrl]:', result)

        if (
          result.success &&
          result.result.type === 'openid-authorization-request' &&
          typeof result.result.data === 'string'
        ) {
          const _res = {
            data: result.result.data,
            certificate: extractCertificateFromJwt(result.result.data),
          }

          console.log('$$[extractCertificateFromAuthorizationRequest][if 1]:', _res)

          return {
            data: result.result.data,
            certificate: extractCertificateFromJwt(result.result.data),
          }
        } else {
          console.log('$$[extractCertificateFromAuthorizationRequest][if 1][result fail]!')
        }
      } else if (query.request && typeof query.request === 'string') {
        const _res = {
          data: query.request,
          certificate: extractCertificateFromJwt(query.request),
        }
        console.log('$$[extractCertificateFromAuthorizationRequest][if 2]:', _res)

        return _res
      }
    }

    console.log('$$[extractCertificateFromAuthorizationRequest] end of function')

    return { data: null, certificate: null }
  } catch (error) {
    console.log('$$[extractCertificateFromAuthorizationRequest][catch error]:', JSON.stringify(error))

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

const allowUntrustedCertificates = false

export const getCredentialsForProofRequest = async ({ agent, data, uri }: OpenID4VCIParam) => {
  let requestUri = uri

  try {
    const { certificate = null, data: newData = null } = allowUntrustedCertificates
      ? await extractCertificateFromAuthorizationRequest({ data, uri })
      : {}

    if (newData) {
      // FIXME: Credo only support request string, but we already parsed it before. So we construct an request here
      // but in the future we need to support the parsed request in Credo directly
      requestUri = `openid://?request=${encodeURIComponent(newData)}`
      console.log('$$Request URI set with data:')
    } else if (uri) {
      console.log('$$Request URI set with uri')

      requestUri = uri
    } else {
      throw new Error('Either data or uri must be provided')
    }

    agent.config.logger.info(`$$Receiving openid uri ${requestUri}`)

    // Temp solution to add and remove the trusted certificate
    const resolved = await withTrustedCertificate(agent, certificate, () => {
      console.log('$$to agent:', requestUri)
      return agent.modules.openId4VcHolder.resolveSiopAuthorizationRequest(requestUri)
    })

    console.log('$$RESOLVEDDDDDDD:', JSON.stringify(resolved))

    //   if (!resolved.presentationExchange) {
    //     throw new Error('No presentation exchange found in authorization request.')
    //   }
  } catch (err) {
    console.log('$$Error: ', (err as Error)?.message ?? err)
    throw err
  }
}
