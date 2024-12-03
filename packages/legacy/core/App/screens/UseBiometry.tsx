import { CommonActions, useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Modal, ScrollView, DeviceEventEmitter, Linking, Platform } from 'react-native'
import { PERMISSIONS, RESULTS, request, check, PermissionStatus } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ToggleButton from '../components/buttons/ToggleButton'
import { EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import DismissiblePopupModal from '../components/modals/DismissiblePopupModal'

import PINEnter, { PINEntryUsage } from './PINEnter'
import { TOKENS, useServices } from '../container-api'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { useAppAgent } from '../utils/agent'

enum UseBiometryUsage {
  InitialSetup,
  ToggleOnOff,
}

const UseBiometry: React.FC = () => {
  const [store, dispatch] = useStore()
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const [{ enablePushNotifications }, logger, historyManagerCurried, historyEnabled, historyEventsLogger] = useServices(
    [TOKENS.CONFIG, TOKENS.UTIL_LOGGER, TOKENS.FN_LOAD_HISTORY, TOKENS.HISTORY_ENABLED, TOKENS.HISTORY_EVENTS_LOGGER]
  )
  const { isBiometricsActive, commitPIN, disableBiometrics } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [settingsPopupConfig, setSettingsPopupConfig] = useState<null | { title: string; description: string }>(null)
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const screenUsage = useMemo(() => {
    return store.onboarding.didCompleteOnboarding ? UseBiometryUsage.ToggleOnOff : UseBiometryUsage.InitialSetup
  }, [store.onboarding.didCompleteOnboarding])

  const BIOMETRY_PERMISSION = PERMISSIONS.IOS.FACE_ID

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
  })

  useEffect(() => {
    isBiometricsActive().then((result) => {
      setBiometryAvailable(result)
    })
  }, [isBiometricsActive])

  useEffect(() => {
    if (screenUsage === UseBiometryUsage.InitialSetup) {
      return
    }

    if (biometryEnabled) {
      commitPIN(biometryEnabled).then(() => {
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [biometryEnabled],
        })
      })
    } else {
      disableBiometrics().then(() => {
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [biometryEnabled],
        })
      })
    }
  }, [screenUsage, biometryEnabled, commitPIN, disableBiometrics, dispatch])

  const logHistoryRecord = useCallback(
    (type: HistoryCardType) => {
      try {
        if (!(agent && historyEnabled)) {
          logger.trace(
            `[${UseBiometry.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
          )
          return
        }
        const historyManager = historyManagerCurried(agent)

        /** Save history record for card accepted */
        const recordData: HistoryRecord = {
          type: type,
          message: type,
          createdAt: new Date(),
        }
        historyManager.saveHistory(recordData)
      } catch (err: unknown) {
        logger.error(`[${UseBiometry.name}]:[logHistoryRecord] Error saving history: ${err}`)
      }
    },
    [agent, historyEnabled, logger, historyManagerCurried]
  )

  const continueTouched = useCallback(async () => {
    setContinueEnabled(false)

    await commitPIN(biometryEnabled)

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [biometryEnabled],
    })
    if (enablePushNotifications) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.UsePushNotifications }],
        })
      )
    } else {
      dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
    }
  }, [biometryEnabled, commitPIN, dispatch, enablePushNotifications, navigation])

  const onOpenSettingsTouched = async () => {
    await Linking.openSettings()
    onOpenSettingsDismissed()
  }

  const onOpenSettingsDismissed = () => {
    setSettingsPopupConfig(null)
  }

  const onSwitchToggleAllowed = useCallback(
    (newValue: boolean) => {
      if (screenUsage === UseBiometryUsage.ToggleOnOff) {
        setCanSeeCheckPIN(true)
        DeviceEventEmitter.emit(EventTypes.BIOMETRY_UPDATE, true)
        if (
          historyEventsLogger.logToggleBiometry &&
          store.onboarding.didAgreeToTerms &&
          store.onboarding.didConsiderBiometry
        ) {
          const type = HistoryCardType.ActivateBiometry
          logHistoryRecord(type)
        }
      } else {
        setBiometryEnabled(newValue)
      }
    },
    [
      screenUsage,
      historyEventsLogger.logToggleBiometry,
      logHistoryRecord,
      store.onboarding.didAgreeToTerms,
      store.onboarding.didConsiderBiometry,
    ]
  )

  const onRequestSystemBiometrics = useCallback(
    async (newToggleValue: boolean) => {
      const permissionResult: PermissionStatus = await request(BIOMETRY_PERMISSION)
      switch (permissionResult) {
        case RESULTS.GRANTED:
        case RESULTS.LIMITED:
          // Granted
          onSwitchToggleAllowed(newToggleValue)
          break
        default:
          break
      }
    },
    [onSwitchToggleAllowed, BIOMETRY_PERMISSION]
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
  }, [biometryAvailable, BIOMETRY_PERMISSION])

  const toggleSwitch = useCallback(async () => {
    const newValue = !biometryEnabled

    if (!newValue) {
      // Turning off doesn't require OS'es biometrics enabled
      onSwitchToggleAllowed(newValue)
      return
    }

    // If the user is turning it on, they need
    // to first authenticate the OS'es biometrics before this action is accepted
    const permissionResult: PermissionStatus = await onCheckSystemBiometrics()
    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Already granted
        onSwitchToggleAllowed(newValue)
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
  }, [onSwitchToggleAllowed, onRequestSystemBiometrics, onCheckSystemBiometrics, biometryEnabled, t])

  const onAuthenticationComplete = useCallback(
    (status: boolean) => {
      // If successfully authenticated the toggle may proceed.
      if (status) {
        setBiometryEnabled((previousState) => !previousState)
      }
      DeviceEventEmitter.emit(EventTypes.BIOMETRY_UPDATE, false)
      if (
        historyEventsLogger.logToggleBiometry &&
        store.onboarding.didAgreeToTerms &&
        store.onboarding.didConsiderBiometry
      ) {
        const type = HistoryCardType.DeactivateBiometry
        logHistoryRecord(type)
      }
      setCanSeeCheckPIN(false)
    },
    [
      historyEventsLogger.logToggleBiometry,
      logHistoryRecord,
      store.onboarding.didAgreeToTerms,
      store.onboarding.didConsiderBiometry,
    ]
  )

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
          <View>
            <Text style={TextTheme.normal}>{t('Biometry.EnabledText1')}</Text>
            <Text></Text>
            <Text style={TextTheme.normal}>
              {t('Biometry.EnabledText2')}
              <Text style={TextTheme.bold}> {t('Biometry.Warning')}</Text>
            </Text>
          </View>
        ) : (
          <View>
            <Text style={TextTheme.normal}>{t('Biometry.NotEnabledText1')}</Text>
            <Text></Text>
            <Text style={TextTheme.normal}>{t('Biometry.NotEnabledText2')}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', marginVertical: 20 }}>
          <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
            <Text style={TextTheme.bold}>{t('Biometry.UseToUnlock')}</Text>
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
        {store.onboarding.didCompleteOnboarding || (
          <Button
            title={'Continue'}
            accessibilityLabel={'Continue'}
            testID={testIdWithKey('Continue')}
            onPress={continueTouched}
            buttonType={ButtonType.Primary}
            disabled={!continueEnabled}
          >
            {!continueEnabled && <ButtonLoading />}
          </Button>
        )}
      </View>
      <Modal
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        visible={canSeeCheckPIN}
        transparent={false}
        animationType={'slide'}
      >
        <PINEnter usage={PINEntryUsage.PINCheck} setAuthenticated={onAuthenticationComplete} />
      </Modal>
    </SafeAreaView>
  )
}

export default UseBiometry
