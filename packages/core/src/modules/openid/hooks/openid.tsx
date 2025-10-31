import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
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

type OpenIDContextProps = {
  openIDUri?: string
  openIDPresentationUri?: string
}

export const useOpenID = ({
  openIDUri,
  openIDPresentationUri,
}: OpenIDContextProps): SdJwtVcRecord | W3cCredentialRecord | MdocRecord | OpenId4VPRequestRecord | undefined => {
  const [openIdRecord, setOpenIdRecord] = useState<
    SdJwtVcRecord | W3cCredentialRecord | MdocRecord | OpenId4VPRequestRecord
  >()

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

        const authServers = resolvedCredentialOffer.metadata.credentialIssuerMetadata.authorization_servers
        // const authServer = authServers?.[0]
        const credentialIssuer = resolvedCredentialOffer.metadata.issuer
        const authServer = credentialIssuer
        const configID = getCredentialConfigurationIds(resolvedCredentialOffer)?.[0]
        const tokenEndpoint = resolvedCredentialOffer.metadata.token_endpoint
        const issuerMetadata = resolvedCredentialOffer.metadata.credentialIssuerMetadata
        const credentialEndpoint = resolvedCredentialOffer.metadata.credential_endpoint

        if (!configID) {
          throw new Error('No credential configuration ID found in the credential offer metadata')
        }
        if (!authServer) {
          throw new Error('No authorization server found in the credential offer metadata')
        }
        if (!credentialIssuer) {
          throw new Error('No credential issuer found in the credential offer metadata')
        }

        const tokenResponse = await acquirePreAuthorizedAccessToken({ agent, resolvedCredentialOffer })

        const refreshToken = tokenResponse.refreshToken

        const credential = await receiveCredentialFromOpenId4VciOffer({
          agent,
          resolvedCredentialOffer,
          tokenResponse: tokenResponse,
        })

        // console.log(' #### [useOpenID] Received credential from OpenID4VCI offer:', JSON.stringify(credential))

        if (refreshToken && authServer) {
          // console.log(' #### [useOpenID] Setting refresh metadata for credential:', JSON.stringify(gg))
          setRefreshCredentialMetadata(credential, {
            authServer: authServer,
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
        //TODO: Sppecify different error
        const error = new BifoldError(
          t('Error.Title1024'),
          t('Error.Message1024'),
          (err as Error)?.message ?? err,
          1043
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
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
          uri: uri,
        })
        return record
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1043'),
          t('Error.Message1043'),
          (err as Error)?.message ?? err,
          1043
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
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
