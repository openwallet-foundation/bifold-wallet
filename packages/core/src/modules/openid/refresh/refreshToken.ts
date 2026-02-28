import { AgentContext, MdocRecord, SdJwtVcRecord, W3cCredentialRecord, W3cV2CredentialRecord } from '@credo-ts/core'
import { BifoldLogger } from '../../../services/logger'
import { RefreshResponse } from '../types'
import { getRefreshCredentialMetadata, persistCredentialRecord, setRefreshCredentialMetadata } from '../metadata'

export async function refreshAccessToken({
  logger,
  cred,
  agentContext,
}: {
  logger: BifoldLogger
  cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord
  agentContext: AgentContext
}): Promise<RefreshResponse | undefined> {
  logger.info(`[refreshAccessToken] Checking new credential for record: ${cred.id}`)
  //   return _mockTokenRefreshResponse
  const refreshMetaData = getRefreshCredentialMetadata(cred)
  if (!refreshMetaData) {
    logger.error(`[refreshAccessToken] No refresh metadata found for credential: ${cred.id}`)
    return
  }

  logger.info(`[refreshAccessToken] Found refresh metadata for credential: ${cred.id}`)
  const { refreshToken, authServer } = refreshMetaData

  try {
    if (!authServer) {
      throw new Error('No authorization server found in the credential offer metadata')
    }

    logger.info(`[refreshAccessToken] Found auth server for credential: ${cred.id}: ${authServer}`)

    // Build token endpoint:
    // React-Native-safe URL build
    const tokenUrl = (authServer.endsWith('/') ? authServer.slice(0, -1) : authServer)
    // const tokenUrl = new URL('token', authServer)
    // tokenUrl.searchParams.set('force', 'false')

    logger.info(`[refreshAccessToken] Refreshing access token at URL: ${tokenUrl} for credential: ${cred.id}`)

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      // these are accepted by some ASs that share the same endpoint with pre-auth:
      pre_authorized_code: '',
      pre_authorized_code_alt: '',
      user_pin: '',
    })

    const res = await fetch(tokenUrl.toString(), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    logger.info(`[refreshAccessToken] Response status: ${JSON.stringify(res)}`)

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Refresh failed ${res.status}: ${errText}`)
    }

    const data: RefreshResponse = await res.json()
    logger.info(`[refreshAccessToken] New access token acquired: ${JSON.stringify(data)}`)

    // If refresh token rotated, persist it
    if (data.refresh_token && data.refresh_token !== refreshToken) {
      logger.info(`[refreshAccessToken] Refresh token rotated; saving new one`)
      setRefreshCredentialMetadata(cred, {
        ...refreshMetaData,
        authServer: authServer,
        refreshToken: data.refresh_token,
      })

      await persistCredentialRecord(agentContext, cred)
    }

    return data
  } catch (error) {
    logger.error(`[refreshAccessToken] Error getting new token: ${error}`)
    throw error
  }
}
