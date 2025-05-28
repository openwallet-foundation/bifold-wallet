import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'

import ToggleButton from '../buttons/ToggleButton'
import DismissiblePopupModal from '../modals/DismissiblePopupModal'
import { ThemedText } from '../texts/ThemedText'
import { useAuth } from '../../contexts/auth'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { getSupportedBiometryType, BIOMETRY_TYPE } from 'react-native-keychain'

const BIOMETRY_PERMISSION = PERMISSIONS.IOS.FACE_ID

export interface BiometryControlProps {
  biometryEnabled: boolean
  onBiometryToggle: (newValue: boolean) => void
  children?: React.ReactNode
}

const BiometryControl: React.FC<BiometryControlProps> = ({ biometryEnabled, onBiometryToggle, children }) => {
  const { t } = useTranslation()
  const { isBiometricsActive } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [settingsPopupConfig, setSettingsPopupConfig] = useState<null | { title: string; description: string }>(null)
  const { ColorPallet, Assets } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      padding: 20,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    image: {
      minWidth: 200,
      minHeight: 200,
      marginBottom: 66,
    },
    biometryAvailableRowGap: {
      rowGap: 20,
    },
  })

  useEffect(() => {
    isBiometricsActive().then((result: boolean) => {
      setBiometryAvailable(result)
    })
  }, [isBiometricsActive])

  const onOpenSettingsTouched = async () => {
    await Linking.openSettings()
    onOpenSettingsDismissed()
  }

  const onOpenSettingsDismissed = () => {
    setSettingsPopupConfig(null)
  }

  const onRequestSystemBiometrics = useCallback(
    async (newToggleValue: boolean) => {
      const permissionResult: PermissionStatus = await request(BIOMETRY_PERMISSION)
      switch (permissionResult) {
        case RESULTS.GRANTED:
        case RESULTS.LIMITED:
          // Granted
          onBiometryToggle(newToggleValue)
          break
        default:
          break
      }
    },
    [onBiometryToggle]
  )

  const onCheckSystemBiometrics = useCallback(async (): Promise<PermissionStatus> => {
    if (Platform.OS === 'android') {
      // Android doesn't need to prompt biometric permission
      // for an app to use it.
      return biometryAvailable ? RESULTS.GRANTED : RESULTS.UNAVAILABLE
    } else if (Platform.OS === 'ios') {
      return await check(BIOMETRY_PERMISSION)
    }

    return RESULTS.UNAVAILABLE
  }, [biometryAvailable])

  const toggleSwitch = useCallback(async () => {
    const newValue = !biometryEnabled

    if (!newValue) {
      // Turning off doesn't require OS biometrics enabled
      onBiometryToggle(newValue)
      return
    }

    // If the user is turning it on, they need
    // to first authenticate the OS biometrics before this action is accepted
    const permissionResult: PermissionStatus = await onCheckSystemBiometrics()
    const supported_type = await getSupportedBiometryType()

    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Already granted
        onBiometryToggle(newValue)
        break
      case RESULTS.UNAVAILABLE:
        // Permission is unavailable/ not supported on this device
        if (Platform.OS === 'ios' && supported_type === BIOMETRY_TYPE.TOUCH_ID) {
          // if available, access to touch id can be granted without a request
          onBiometryToggle(newValue)
        } else {
          // Not in iOS or no touch id available for iOS, send user to settings
          // to enable biometrics
          setSettingsPopupConfig({
            title: t('Biometry.SetupBiometricsTitle'),
            description: t('Biometry.SetupBiometricsDesc'),
          })
        }
        break
      case RESULTS.BLOCKED:
        // Previously denied
        setSettingsPopupConfig({
          title: t('Biometry.AllowBiometricsTitle'),
          description: t('Biometry.AllowBiometricsDesc'),
        })
        break
      case RESULTS.DENIED:
        // Has not been requested
        await onRequestSystemBiometrics(newValue)
        break
      default:
        break
    }
  }, [onRequestSystemBiometrics, onCheckSystemBiometrics, biometryEnabled, t, onBiometryToggle])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      {settingsPopupConfig && (
        <DismissiblePopupModal
          title={settingsPopupConfig.title}
          description={settingsPopupConfig.description}
          onCallToActionLabel={t('Biometry.OpenSettings')}
          onCallToActionPressed={onOpenSettingsTouched}
          onDismissPressed={onOpenSettingsDismissed}
        />
      )}
      <ScrollView style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Assets.svg.biometrics style={styles.image} />
        </View>
        {biometryAvailable ? (
          <View style={styles.biometryAvailableRowGap}>
            <ThemedText>{t('Biometry.EnabledText1')}</ThemedText>
            <ThemedText>
              {t('Biometry.EnabledText2')}
              <ThemedText variant="bold"> {t('Biometry.Warning')}</ThemedText>
            </ThemedText>
          </View>
        ) : (
          <View style={styles.biometryAvailableRowGap}>
            <ThemedText>{t('Biometry.NotEnabledText1')}</ThemedText>
            <ThemedText>{t('Biometry.NotEnabledText2')}</ThemedText>
          </View>
        )}
        <View style={{ flexDirection: 'row', marginVertical: 20 }}>
          <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
            <ThemedText variant="bold">{t('Biometry.UseToUnlock')}</ThemedText>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <ToggleButton
              testID={testIdWithKey('ToggleBiometrics')}
              isEnabled={biometryEnabled}
              isAvailable={true}
              toggleAction={toggleSwitch}
              disabled={false}
              enabledIcon="check"
              disabledIcon="close"
            />
          </View>
        </View>
      </ScrollView>
      {children}
    </SafeAreaView>
  )
}

export default BiometryControl
