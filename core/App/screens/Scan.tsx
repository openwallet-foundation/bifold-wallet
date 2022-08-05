import type { BarCodeReadEvent } from 'react-native-camera'

import { Agent } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import QRScanner from '../components/misc/QRScanner'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { isRedirection } from '../utils/helpers'

import CameraDisclosure from './CameraDisclosure'

type ScanProps = StackScreenProps<ConnectStackParams>

const DidShowCameraDisclosureLocalStorageKey = 'DidShowCameraDisclosure'

const Scan: React.FC<ScanProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [didShowCameraDisclosure, setDidShowCameraDisclosure] = useState<boolean | null>()

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
      const error = new BifoldError(t('Error.Title1030'), t('Error.Message1030'), (err as Error).message, 1030)
      throw error
    }
  }

  useMemo(async () => {
    const data = await AsyncStorage.getItem(DidShowCameraDisclosureLocalStorageKey)
    const record = data !== null ? JSON.parse(data) : null

    setDidShowCameraDisclosure(record !== null ? record.didShowCameraDisclosure : false)
  }, [])

  useEffect(() => {
    const saveDidShowCameraDisclosure = async () => {
      await AsyncStorage.setItem(
        DidShowCameraDisclosureLocalStorageKey,
        JSON.stringify({ didShowCameraDisclosure: didShowCameraDisclosure })
      )
    }

    saveDidShowCameraDisclosure().catch((err: unknown) => {
      // console.log('Problem', err)
    })
  }, [didShowCameraDisclosure])

  const handleInvitation = async (url: string): Promise<void> => {
    try {
      const invitation = await agent?.oob.parseInvitation(url)
      if (!invitation) {
        throw new Error('Could not parse invitation from URL')
      }

      const record = await agent?.oob.receiveInvitation(invitation)
      const connectionRecord = record?.connectionRecord
      if (!connectionRecord?.id) {
        throw new Error('Connection does not have an ID')
      }

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
    setDidShowCameraDisclosure(true)
  }

  return (
    <>
      {(!didShowCameraDisclosure && <CameraDisclosure didDismissCameraDisclosure={didDismissCameraDisclosure} />) || (
        <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
      )}
    </>
  )
}

export default Scan
