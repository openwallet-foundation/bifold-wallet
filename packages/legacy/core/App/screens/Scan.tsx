import type { BarCodeReadEvent } from 'react-native-camera'

import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { check, Permission, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import NewQRView from '../components/misc/NewQRView'
import QRScanner from '../components/misc/QRScanner'
import CameraDisclosureModal from '../components/modals/CameraDisclosureModal'
import { ToastType } from '../components/toast/BaseToast'
import LoadingView from '../components/views/LoadingView'
import { useStore } from '../contexts/store'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams, Screens, Stacks } from '../types/navigators'
import { PermissionContract } from '../types/permissions'
import { connectFromInvitation, getJson, getUrl, receiveMessageFromUrlRedirect } from '../utils/helpers'

export type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [store] = useStore()
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  let defaultToConnect = false
  if (route?.params && route.params['defaultToConnect']) {
    defaultToConnect = route.params['defaultToConnect']
  }
  let implicitInvitations = false
  if (route?.params && route.params['implicitInvitations']) {
    implicitInvitations = route.params['implicitInvitations']
  }
  let reuseConnections = false
  if (route?.params && route.params['reuseConnections']) {
    reuseConnections = route.params['reuseConnections']
  }

  const handleInvitation = async (value: string): Promise<void> => {
    try {
      const receivedInvitation = await connectFromInvitation(value, agent, implicitInvitations, reuseConnections)
      if (receivedInvitation?.connectionRecord?.id) {
        // not connectionless
        navigation.getParent()?.navigate(Stacks.ConnectionStack, {
          screen: Screens.Connection,
          params: { connectionId: receivedInvitation.connectionRecord.id },
        })
      } else {
        //connectionless
        navigation.navigate(Stacks.ConnectionStack as any, {
          screen: Screens.Connection,
          params: { threadId: receivedInvitation?.outOfBandRecord.outOfBandInvitation.threadId },
        })
      }
    } catch (err: unknown) {
      // [Error: Connection does not have an ID]
      // [AriesFrameworkError: An out of band record with invitation 05fe3693-2c12-4165-a3b6-370280ccd43b has already been received. Invitations should have a unique id.]
      try {
        // if scanned value is json -> pass into AFJ as is
        const json = getJson(value)
        if (json) {
          await agent?.receiveMessage(json)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: json['@id'] },
          })
          return
        }

        // if scanned value is url -> receive message from it
        const url = getUrl(value)
        if (url) {
          const message = await receiveMessageFromUrlRedirect(value, agent)
          navigation.getParent()?.navigate(Stacks.ConnectionStack, {
            screen: Screens.Connection,
            params: { threadId: message['@id'] },
          })
          return
        }
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1031'),
          t('Error.Message1031'),
          (err as Error)?.message ?? err,
          1031
        )
        // throwing for QrCodeScanError
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

  const permissionFlow = async (method: PermissionContract, permission: Permission): Promise<boolean> => {
    try {
      const permissionResult = await method(permission)
      if (permissionResult === RESULTS.GRANTED) {
        setShowDisclosureModal(false)
        return true
      }
    } catch (error: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (error as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    return false
  }

  const requestCameraUse = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return await permissionFlow(request, PERMISSIONS.ANDROID.CAMERA)
    } else if (Platform.OS === 'ios') {
      return await permissionFlow(request, PERMISSIONS.IOS.CAMERA)
    }

    return false
  }

  useEffect(() => {
    const asyncEffect = async () => {
      if (Platform.OS === 'android') {
        await permissionFlow(check, PERMISSIONS.ANDROID.CAMERA)
      } else if (Platform.OS === 'ios') {
        await permissionFlow(check, PERMISSIONS.IOS.CAMERA)
      }
      setLoading(false)
    }

    asyncEffect()
  }, [])

  if (loading) {
    return <LoadingView />
  }

  if (showDisclosureModal) {
    return <CameraDisclosureModal requestCameraUse={requestCameraUse} />
  }

  if (store.preferences.useConnectionInviterCapability) {
    return (
      <NewQRView
        defaultToConnect={defaultToConnect}
        handleCodeScan={handleCodeScan}
        error={qrCodeScanError}
        enableCameraOnError={true}
        navigation={navigation}
        route={route}
      />
    )
  } else {
    return <QRScanner handleCodeScan={handleCodeScan} error={qrCodeScanError} enableCameraOnError={true} />
  }
}

export default Scan
