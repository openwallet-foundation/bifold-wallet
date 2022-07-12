import type { BarCodeReadEvent } from 'react-native-camera'

import { Agent } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { uiConfig } from '../config/ui'
import QRScanner from '../components/misc/QRScanner'
import { BifoldError, QrCodeScanError } from '../types/error'
import { TabStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { isRedirection } from '../utils/helpers'

type ScanProps = StackScreenProps<TabStackParams>

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)

  const handleRedirection = async (url: string, agent?: Agent): Promise<void> => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      })
      const message = await res.json()
      await agent?.receiveMessage(message)
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { threadId: message['@id'] },
      })
    } catch (err: unknown) {
      const error = new BifoldError(
        'Unable to accept connection',
        'There was a problem while accepting the connection redirection',
        (err as Error).message,
        1030
      )
      throw error
    }
  }

  const handleInvitation = async (url: string): Promise<void> => {
    try {
      const connectionRecord = await agent?.connections.receiveInvitationFromUrl(url, {
        autoAcceptConnection: true,
      })

      if (!connectionRecord?.id) {
        throw new Error('Connection does not have an ID')
      }
      navigation.goBack()
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: connectionRecord.id },
      })
    } catch (err: unknown) {
      const error = new BifoldError(
        'Unable to accept connection',
        'There was a problem while accepting the connection.',
        (err as Error).message,
        1031
      )
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

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', () => {
      
  //   });
  //   return unsubscribe;
  // }, [navigation])

  return <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
}

export default Scan
