import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { PERMISSIONS, Permission, RESULTS, Rationale, check, request } from 'react-native-permissions'
import Toast from 'react-native-toast-message'

import QRScanner from '../components/misc/QRScanner'
import CameraDisclosureModal from '../components/modals/CameraDisclosureModal'
import { ToastType } from '../components/toast/BaseToast'
import LoadingView from '../components/views/LoadingView'
import { TOKENS, useServices } from '../container-api'
import { useStore } from '../contexts/store'
import { BifoldError, QrCodeScanError } from '../types/error'
import { ConnectStackParams } from '../types/navigators'
import { PermissionContract } from '../types/permissions'
import { connectFromScanOrDeepLink } from '../utils/helpers'

export type ScanProps = StackScreenProps<ConnectStackParams>

const Scan: React.FC<ScanProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [store] = useStore()
  const [loading, setLoading] = useState<boolean>(true)
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(true)
  const [qrCodeScanError, setQrCodeScanError] = useState<QrCodeScanError | null>(null)
  const [{ enableImplicitInvitations, enableReuseConnections }, logger] = useServices([
    TOKENS.CONFIG,
    TOKENS.UTIL_LOGGER,
  ])
  let defaultToConnect = false
  if (route?.params && route.params['defaultToConnect']) {
    defaultToConnect = route.params['defaultToConnect']
  }

  const handleInvitation = useCallback(
    async (value: string): Promise<void> => {
      try {
        await connectFromScanOrDeepLink(
          value,
          agent,
          logger,
          navigation?.getParent(),
          false, // isDeepLink
          enableImplicitInvitations,
          enableReuseConnections
        )
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
    },
    [agent, logger, navigation, enableImplicitInvitations, enableReuseConnections, t]
  )

  const handleCodeScan = useCallback(
    async (value: string) => {
      setQrCodeScanError(null)
      try {
        const uri = value
        await handleInvitation(uri)
      } catch (e: unknown) {
        const error = new QrCodeScanError(t('Scan.InvalidQrCode'), value, (e as Error)?.message)
        setQrCodeScanError(error)
      }
    },
    [handleInvitation, t]
  )

  const permissionFlow = useCallback(
    async (method: PermissionContract, permission: Permission, rationale?: Rationale): Promise<boolean> => {
      try {
        const permissionResult = await method(permission, rationale)
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
    },
    [t]
  )

  const requestCameraUse = async (rationale?: Rationale): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return await permissionFlow(request, PERMISSIONS.ANDROID.CAMERA, rationale)
    } else if (Platform.OS === 'ios') {
      return await permissionFlow(request, PERMISSIONS.IOS.CAMERA, rationale)
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
  }, [permissionFlow])

  if (loading) {
    return <LoadingView />
  }

  if (showDisclosureModal) {
    return <CameraDisclosureModal requestCameraUse={requestCameraUse} />
  }

  return (
    <QRScanner
      showTabs={store.preferences.useConnectionInviterCapability}
      defaultToConnect={defaultToConnect}
      handleCodeScan={handleCodeScan}
      error={qrCodeScanError}
      enableCameraOnError={true}
      navigation={navigation}
      route={route}
    />
  )
}

export default Scan
