import type { BarCodeReadEvent } from 'react-native-camera'

import { Agent, ConnectionState } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { parseUrl } from 'query-string'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'

import { QrCodeScanError } from '../types/erorr'

import { QRScanner } from 'components'
import { TabStackParams } from 'types/navigators'

interface ScanProps {
  navigation: BottomTabNavigationProp<TabStackParams, 'ScanTab'>
}

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()

  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [connectionId, setConnectionId] = useState('')
  const connection = useConnectionById(connectionId)

  const displayPendingMessage = (): void => {
    Toast.show({
      type: 'info',
      text1: t('Scan.AcceptingConnection'),
    })
  }

  const displaySuccessMessage = (): void => {
    Toast.show({
      type: 'success',
      text1: t('Scan.ConnectionAccepted'),
    })
  }

  const isRedirecton = (url: string): boolean => {
    const queryParams = parseUrl(url).query
    return !(queryParams['c_i'] || queryParams['d_m'])
  }

  const handleRedirection = async (url: string, agent?: Agent): Promise<void> => {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    })
    const message = await res.json()
    // TODO: Change to a full screen modal
    displayPendingMessage()
    await agent?.receiveMessage(message)
  }

  const handleInvitation = async (url: string): Promise<void> => {
    // TODO: Change to a full screen modal
    displayPendingMessage()
    const connectionRecord = await agent?.connections.receiveInvitationFromUrl(url, {
      autoAcceptConnection: true,
    })
    if (!connectionRecord?.id) {
      throw new Error(t('Scan.ConnectionNotFound'))
    }
    setConnectionId(connectionRecord.id)
  }

  useEffect(() => {
    if (connection?.state === ConnectionState.Complete) {
      Toast.show({
        type: 'success',
        text1: t('Scan.ConnectionAccepted'),
      })
      navigation.navigate('HomeTab')
    }
  }, [connection])

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setQrCodeScanError(null)

    try {
      const url = event.data
      if (isRedirecton(url)) {
        await handleRedirection(url, agent)
      } else {
        await handleInvitation(url)
      }

      // TODO: Change to a full screen modal
      displaySuccessMessage()

      navigation.navigate('HomeTab')
    } catch (e: unknown) {
      const error = new QrCodeScanError(t('Scan.InvalidQrCode'), event.data)
      setQrCodeScanError(error)
    }
  }

  return (
    <View>
      <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
    </View>
  )
}

export default Scan
