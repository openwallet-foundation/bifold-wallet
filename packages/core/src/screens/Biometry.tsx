import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ToggleButton from '../components/buttons/ToggleButton'
import DismissiblePopupModal from '../components/modals/DismissiblePopupModal'
import { ThemedText } from '../components/texts/ThemedText'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const BIOMETRY_PERMISSION = PERMISSIONS.IOS.FACE_ID

const Biometry: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { isBiometricsActive, commitWalletToKeychain } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [settingsPopupConfig, setSettingsPopupConfig] = useState<null | { title: string; description: string }>(null)
  const { ColorPallet, Assets } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()

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
    isBiometricsActive().then((result) => {
      setBiometryAvailable(result)
    })
  }, [isBiometricsActive])

  const continueTouched = useCallback(async () => {
    setContinueEnabled(false)

    await commitWalletToKeychain(biometryEnabled)

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
  }, [biometryEnabled, commitWalletToKeychain, dispatch])

  const onOpenSettingsTouched = async () => {
    await Linking.openSettings()
    onOpenSettingsDismissed()
  }

  const onOpenSettingsDismissed = () => {
    setSettingsPopupConfig(null)
  }

  const onRequestSystemBiometrics = useCallback(async (newToggleValue: boolean) => {
    const permissionResult: PermissionStatus = await request(BIOMETRY_PERMISSION)
    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Granted
        setBiometryEnabled(newToggleValue)
        break
      default:
        break
    }
  }, [])

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
      // Turning off doesn't require OS'es biometrics enabled
      setBiometryEnabled(newValue)
      return
    }

    // If the user is turning it on, they need
    // to first authenticate the OS'es biometrics before this action is accepted
    const permissionResult: PermissionStatus = await onCheckSystemBiometrics()
    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Already granted
        setBiometryEnabled(newValue)
        break
      case RESULTS.UNAVAILABLE:
        setSettingsPopupConfig({
          title: t('Biometry.SetupBiometricsTitle'),
          description: t('Biometry.SetupBiometricsDesc'),
        })
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
  }, [onRequestSystemBiometrics, onCheckSystemBiometrics, biometryEnabled, t])

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
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('Global.Continue')}
          accessibilityLabel={'Continue'}
          testID={testIdWithKey('Continue')}
          onPress={continueTouched}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
        >
          {!continueEnabled && <ButtonLoading />}
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default Biometry
