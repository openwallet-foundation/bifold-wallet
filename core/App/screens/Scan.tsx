import type { BarCodeReadEvent } from 'react-native-camera'

import { Agent } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import QRScanner from '../components/misc/QRScanner'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { connectFromInvitation, connectFromRedirection, isRedirection } from '../utils/helpers'

import CameraDisclosure from './CameraDisclosure'

type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [state, dispatch] = useStore()

  const handleRedirection = async (url: string, agent?: Agent): Promise<void> => {
    try {
      const message = await connectFromRedirection(url, agent)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { threadId: message['@id'] },
      })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1030'), t('Error.Message1030'), (err as Error).message, 1030)
      throw error
    }
  }

  const handleInvitation = async (url: string): Promise<void> => {
    try {
      const connectionRecord = await connectFromInvitation(url, agent)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord.id },
      })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1031'), t('Error.Message1031'), (err as Error).message, 1031)
      throw error
    }
  }

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setQrCodeScanError(null)
    try {
      const url = event.data
      if (isRedirection(url)) {
        await handleRedirection(url, agent)
      } else {
        await handleInvitation(url)
      }
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
