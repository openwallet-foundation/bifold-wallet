import { Header, HeaderBackButton, useHeaderHeight } from '@react-navigation/elements'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions'
import { SafeAreaView } from 'react-native-safe-area-context'

import ToggleButton from '../components/buttons/ToggleButton'
import DismissiblePopupModal from '../components/modals/DismissiblePopupModal'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useAppAgent } from '../utils/agent'
import { testIdWithKey } from '../utils/testable'

import { ThemedText } from '../components/texts/ThemedText'
import { TOKENS, useServices } from '../container-api'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import PINEnter, { PINEntryUsage } from './PINEnter'

const BIOMETRY_PERMISSION = PERMISSIONS.IOS.FACE_ID

interface BackButtonProps {
  setCanSeeCheckPIN: (value: boolean) => void
}

const BackButton: React.FC<BackButtonProps> = ({ setCanSeeCheckPIN }) => (
  <HeaderBackButton onPress={() => setCanSeeCheckPIN(false)} tintColor="white" labelVisible={false} />
)

const ToggleBiometry: React.FC = () => {
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
  const [settingsPopupConfig, setSettingsPopupConfig] = useState<null | { title: string; description: string }>(null)
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState<boolean>(false)
  const { TextTheme, ColorPallet, Assets } = useTheme()
  const headerHeight = useHeaderHeight()

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
  }, [biometryEnabled, commitWalletToKeychain, disableBiometrics, dispatch])

  const logHistoryRecord = useCallback(
    (type: HistoryCardType) => {
      try {
        if (!(agent && historyEnabled)) {
          logger.trace(
            `[${ToggleBiometry.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
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
        logger.error(`[${ToggleBiometry.name}]:[logHistoryRecord] Error saving history: ${err}`)
      }
    },
    [agent, historyEnabled, logger, historyManagerCurried]
  )

  const onOpenSettingsTouched = async () => {
    await Linking.openSettings()
    onOpenSettingsDismissed()
  }

  const onOpenSettingsDismissed = () => {
    setSettingsPopupConfig(null)
  }

  const onSwitchToggleAllowed = useCallback(() => {
    setCanSeeCheckPIN(true)
    if (
      historyEventsLogger.logToggleBiometry &&
      store.onboarding.didAgreeToTerms &&
      store.onboarding.didConsiderBiometry
    ) {
      const type = HistoryCardType.ActivateBiometry
      logHistoryRecord(type)
    }
  }, [
    historyEventsLogger.logToggleBiometry,
    logHistoryRecord,
    store.onboarding.didAgreeToTerms,
    store.onboarding.didConsiderBiometry,
  ])

  const onRequestSystemBiometrics = useCallback(async () => {
    const permissionResult: PermissionStatus = await request(BIOMETRY_PERMISSION)
    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Granted
        onSwitchToggleAllowed()
        break
      default:
        break
    }
  }, [onSwitchToggleAllowed])

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
      onSwitchToggleAllowed()
      return
    }

    // If the user is turning it on, they need
    // to first authenticate the OS'es biometrics before this action is accepted
    const permissionResult: PermissionStatus = await onCheckSystemBiometrics()
    switch (permissionResult) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        // Already granted
        onSwitchToggleAllowed()
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
        await onRequestSystemBiometrics()
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

export default ToggleBiometry
