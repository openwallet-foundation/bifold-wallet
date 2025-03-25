import { Header, useHeaderHeight, HeaderBackButton } from '@react-navigation/elements'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, ScrollView, Linking, Platform } from 'react-native'
import { PERMISSIONS, RESULTS, request, check, PermissionStatus } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ToggleButton from '../components/buttons/ToggleButton'
import DismissiblePopupModal from '../components/modals/DismissiblePopupModal'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useAppAgent } from '../utils/agent'
import { testIdWithKey } from '../utils/testable'

import PINEnter, { PINEntryUsage } from './PINEnter'
import { TOKENS, useServices } from '../container-api'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { ThemedText } from '../components/texts/ThemedText'

enum UseBiometryUsage {
  InitialSetup,
  ToggleOnOff,
}

interface BackButtonProps {
  setCanSeeCheckPIN: (value: boolean) => void
}

const BackButton: React.FC<BackButtonProps> = ({ setCanSeeCheckPIN }) => (
  <HeaderBackButton onPress={() => setCanSeeCheckPIN(false)} tintColor="white" labelVisible={false} />
)

const UseBiometry: React.FC = () => {
  const [store, dispatch] = useStore()
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const [logger, historyManagerCurried, historyEnabled, historyEventsLogger] = useServices([
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])
  const { isBiometricsActive, commitWalletToKeychain, disableBiometrics } = useAuth()
  const [biometryAvailable, setBiometryAvailable] = useState(false)
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [settingsPopupConfig, setSettingsPopupConfig] = useState<null | { title: string; description: string }>(null)
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState<boolean>(false)
  const { TextTheme, ColorPallet, Assets } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const screenUsage = useMemo(() => {
    return store.onboarding.didCompleteOnboarding ? UseBiometryUsage.ToggleOnOff : UseBiometryUsage.InitialSetup
  }, [store.onboarding.didCompleteOnboarding])
  const headerHeight = useHeaderHeight()

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
    biometryAvailableRowGap: {
      rowGap: 20,
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
      commitWalletToKeychain(biometryEnabled).then(() => {
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
  }, [screenUsage, biometryEnabled, commitWalletToKeychain, disableBiometrics, dispatch])

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

  const onSwitchToggleAllowed = useCallback(
    (newValue: boolean) => {
      if (screenUsage === UseBiometryUsage.ToggleOnOff) {
        setCanSeeCheckPIN(true)
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

  const renderHeaderLeft = useCallback(
    () => <BackButton setCanSeeCheckPIN={() => setCanSeeCheckPIN(false)} />,
    [setCanSeeCheckPIN]
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
        {store.onboarding.didCompleteOnboarding || (
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
        )}
      </View>
      <SafeAreaModal
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        visible={canSeeCheckPIN}
        transparent={false}
        animationType={'slide'}
        presentationStyle="fullScreen"
      >
        <Header
          title={t('Screens.EnterPIN')}
          headerTitleStyle={TextTheme.headerTitle}
          headerStyle={{ height: headerHeight }}
          headerLeft={renderHeaderLeft}
        />
        <PINEnter
          usage={PINEntryUsage.ChangeBiometrics}
          setAuthenticated={onAuthenticationComplete}
          onCancelAuth={setCanSeeCheckPIN}
        />
      </SafeAreaModal>
    </SafeAreaView>
  )
}

export default UseBiometry
