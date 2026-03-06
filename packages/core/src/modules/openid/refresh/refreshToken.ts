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
  const { refreshToken, tokenEndpoint } = refreshMetaData

  try {
    if (!tokenEndpoint) {
      throw new Error('No token endpoint found in the credential offer metadata')
    }

    logger.info(`[refreshAccessToken] Found token endpoint for credential: ${cred.id}: ${tokenEndpoint}`)

    // Build token endpoint:
    const tokenUrl = tokenEndpoint.endsWith('/') ? tokenEndpoint.slice(0, -1) : tokenEndpoint
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

    logger.info(`[refreshAccessToken] Token endpoint response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Refresh failed ${res.status}: ${errText}`)
    }

    const data: RefreshResponse = await res.json()
    logger.info(
      `[refreshAccessToken] Token refresh succeeded: ${JSON.stringify({
        token_type: data.token_type,
        expires_in: data.expires_in,
        has_access_token: Boolean(data.access_token),
        has_refresh_token: Boolean(data.refresh_token),
      })}`
    )

    // If refresh token rotated, persist it
    if (data.refresh_token && data.refresh_token !== refreshToken) {
      logger.info(`[refreshAccessToken] Refresh token rotated; saving new one`)
      setRefreshCredentialMetadata(cred, {
        ...refreshMetaData,
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
