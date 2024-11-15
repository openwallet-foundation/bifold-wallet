import { SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { useCallback, useEffect, useState } from 'react'
import { receiveCredentialFromOpenId4VciOffer } from '../resolver'
import { DeviceEventEmitter } from 'react-native'
import { EventTypes } from '../../../constants'
import { BifoldError } from '../../../types/error'
import { useAgent } from '@credo-ts/react-hooks'
import { useTranslation } from 'react-i18next'
import { getCredentialsForProofRequest } from '../resolverProof'
import { OpenId4VPRequestRecord } from '../types'

type OpenIDContextProps = {
  openIDUri?: string
  openIDPresentationUri?: string
}

export const useOpenID = ({
  openIDUri,
  openIDPresentationUri,
}: OpenIDContextProps): SdJwtVcRecord | W3cCredentialRecord | OpenId4VPRequestRecord | undefined => {
  const [openIdRecord, setOpenIdRecord] = useState<SdJwtVcRecord | W3cCredentialRecord | OpenId4VPRequestRecord>()

  const { agent } = useAgent()
  const { t } = useTranslation()

  const resolveOpenIDCredential = useCallback(
    async (uri: string) => {
      if (!agent) {
        return
      }
      try {
        const record = await receiveCredentialFromOpenId4VciOffer({
          agent: agent,
          uri: uri,
        })
        return record
      } catch (err: unknown) {
        //TODO: Sppecify different error
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
