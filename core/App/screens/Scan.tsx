import type { BarCodeReadEvent } from 'react-native-camera'

import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import QRScanner from '../components/misc/QRScanner'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { connectFromInvitation, receiveMessageFromUrlRedirect } from '../utils/helpers'

import CameraDisclosure from './CameraDisclosure'

export type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [state, dispatch] = useStore()

  const handleInvitation = async (uri: string): Promise<void> => {
    try {
      const connectionRecord = await connectFromInvitation(uri, agent)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord.id },
      })
    } catch (err: unknown) {
      try {
        const message = await receiveMessageFromUrlRedirect(uri, agent)
        navigation.getParent()?.navigate(Stacks.ConnectionStack, {
          screen: Screens.Connection,
          params: { threadId: message['@id'] },
        })
      } catch (err: unknown) {
        const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error).message, 1031)
        throw error
      }
    }
  }

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setQrCodeScanError(null)
    try {
      const uri = event.data
      await handleInvitation(uri)
    } catch (e: unknown) {
      const error = new QrCodeScanError(t('Scan.InvalidQrCode'), event.data)
      setQrCodeScanError(error)
    }
  }

  const didDismissCameraDisclosure = () => {
    dispatch({ type: DispatchAction.DID_SHOW_CAMERA_DISCLOSURE, payload: [] })
  }

  return (
    <>
      {(!state.privacy.didShowCameraDisclosure && (
        <CameraDisclosure didDismissCameraDisclosure={didDismissCameraDisclosure} />
      )) || <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />}
    </>
  )
}

export default Scan
