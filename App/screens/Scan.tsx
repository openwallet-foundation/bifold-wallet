import type { BarCodeReadEvent } from 'react-native-camera'

import { Agent, ConnectionState } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, TabStacks } from '../types/navigators'
import { isRedirection } from '../utils/helpers'

import { QRScanner } from 'components'

type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [connectionId, setConnectionId] = useState('')
  const connection = useConnectionById(connectionId)

  const displayPendingMessage = (): void => {
    dispatch({
      type: DispatchAction.ConnectionPending,
      payload: [{ ConnectionPending: true }],
    })
  }

  const displaySuccessMessage = (): void => {
    dispatch({
      type: DispatchAction.ConnectionPending,
      payload: [{ ConnectionPending: false }],
    })
  }

  const handleRedirection = async (url: string, agent?: Agent): Promise<void> => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      })
      const message = await res.json()
      displayPendingMessage()
      await agent?.receiveMessage(message)
    } catch (e: unknown) {
      throw new Error(t('Scan.UnableToHandleRedirection'))
    }
  }

  const handleInvitation = async (url: string): Promise<void> => {
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
      dispatch({
        type: DispatchAction.ConnectionPending,
        payload: [{ ConnectionPending: false }],
      })

      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    }
  }, [connection])

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setQrCodeScanError(null)

    try {
      const url = event.data
      if (isRedirection(url)) {
        await handleRedirection(url, agent)
      } else {
        await handleInvitation(url)
      }

      displaySuccessMessage()

      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } catch (e: unknown) {
      if ((e as Error).message === 'Connection not found') {
        navigation.pop()
        navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
      } else {
        const error = new QrCodeScanError(t('Scan.InvalidQrCode'), event.data)
        setQrCodeScanError(error)
      }
    }
  }

  return <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
}

export default Scan
