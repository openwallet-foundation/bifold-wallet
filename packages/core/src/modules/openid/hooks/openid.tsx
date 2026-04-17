import { useAgent } from '@bifold/react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'
import { EventTypes } from '../../../constants'
import { BifoldError } from '../../../types/error'
import {
  acquirePreAuthorizedAccessToken,
  receiveCredentialFromOpenId4VciOffer,
  resolveOpenId4VciOffer,
} from '../offerResolve'
import { getCredentialsForProofRequest } from '../resolverProof'
import { OpenId4VPRequestRecord } from '../types'
import { getCredentialConfigurationIds } from '../utils/utils'
import { setRefreshCredentialMetadata } from '../metadata'
import { RefreshStatus } from '../refresh/types'
import { temporaryMetaVanillaObject } from '../metadata'
import { OpenIDCredentialRecord } from '../credentialRecord'

type OpenIDContextProps = {
  openIDUri?: string
  openIDPresentationUri?: string
}

export const useOpenID = ({
  openIDUri,
  openIDPresentationUri,
}: OpenIDContextProps): OpenIDCredentialRecord | OpenId4VPRequestRecord | undefined => {
  const [openIdRecord, setOpenIdRecord] = useState<OpenIDCredentialRecord | OpenId4VPRequestRecord>()

  const { agent } = useAgent()
  const { t } = useTranslation()

  const resolveOpenIDCredential = useCallback(
    async (uri: string) => {
      if (!agent) {
        return
      }
      try {
        const resolvedCredentialOffer = await resolveOpenId4VciOffer({
          agent: agent,
          uri: uri,
        })

        const authServers = resolvedCredentialOffer.metadata.credentialIssuer.authorization_servers
        const authServer = resolvedCredentialOffer.metadata.authorizationServers[0]
        const credentialIssuer = authServer.issuer
        const issuerMetadata = resolvedCredentialOffer.metadata.credentialIssuer
        const configID = getCredentialConfigurationIds(resolvedCredentialOffer)?.[0]
        const tokenEndpoint = authServer?.token_endpoint
        const credentialEndpoint = issuerMetadata.credential_endpoint

        if (!configID) {
          throw new Error('No credential configuration ID found in the credential offer metadata')
        }
        if (!credentialIssuer) {
          throw new Error('No credential issuer found in the credential offer metadata')
        }

        const tokenResponse = await acquirePreAuthorizedAccessToken({ agent, resolvedCredentialOffer })
        const refreshToken = tokenResponse.refreshToken

        temporaryMetaVanillaObject.tokenResponse = tokenResponse

        const credential = await receiveCredentialFromOpenId4VciOffer({
          agent,
          resolvedCredentialOffer,
          tokenResponse: tokenResponse,
        })

        if (refreshToken) {
          setRefreshCredentialMetadata(credential, {
            tokenEndpoint: tokenEndpoint,
            refreshToken: refreshToken,
            issuerMetadataCache: {
              credential_issuer: credentialIssuer,
              credential_endpoint: credentialEndpoint,
              token_endpoint: tokenEndpoint,
              authorization_servers: authServers,
              credential_configurations_supported: issuerMetadata?.credential_configurations_supported,
            },
            credentialIssuer: credentialIssuer,
            credentialConfigurationId: configID,
            lastCheckedAt: Date.now(),
            lastCheckResult: RefreshStatus.Valid,
            attemptCount: 0,
            resolvedCredentialOffer: resolvedCredentialOffer,
          })
        }

        return credential
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const error = new BifoldError(
          t('Error.Title1024'),
          errorMessage,
          errorMessage,
          1043
        )
        DeviceEventEmitter.emit(EventTypes.OPENID_CONNECTION_ERROR, error)
      }
    },
    [agent, t]
  )

  const resolveOpenIDPresentationRequest = useCallback(
    async (uri: string) => {
      if (!agent) {
        return
      }
      try {
        const record = await getCredentialsForProofRequest({
          agent: agent,
          request: uri,
        })
        return record
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const error = new BifoldError(
          t('Error.Title1043'),
          errorMessage,
          errorMessage,
          1043
        )
        DeviceEventEmitter.emit(EventTypes.OPENID_CONNECTION_ERROR, error)
      }
    },
    [agent, t]
  )

  useEffect(() => {
    if (!openIDPresentationUri) {
      return
    }
    resolveOpenIDPresentationRequest(openIDPresentationUri).then((value) => {
      if (value) {
        setOpenIdRecord(value)
      }
    })
  }, [openIDPresentationUri, resolveOpenIDPresentationRequest])

  useEffect(() => {
    if (!openIDUri) {
      return
    }
    resolveOpenIDCredential(openIDUri).then((value) => {
      if (value) {
        setOpenIdRecord(value)
      }
    })
  }, [openIDUri, resolveOpenIDCredential])

  return openIdRecord
}
