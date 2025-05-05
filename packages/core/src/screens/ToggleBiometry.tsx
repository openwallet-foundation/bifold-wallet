import { Header, HeaderBackButton, useHeaderHeight } from '@react-navigation/elements'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import BiometryControl from '../components/inputs/BiometryControl'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { TOKENS, useServices } from '../container-api'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { useAppAgent } from '../utils/agent'
import PINVerify, { PINEntryUsage } from './PINVerify'

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
  const { commitWalletToKeychain, disableBiometrics } = useAuth()
  const [biometryEnabled, setBiometryEnabled] = useState(store.preferences.useBiometry)
  const [canSeeCheckPIN, setCanSeeCheckPIN] = useState<boolean>(false)
  const { TextTheme, ColorPallet } = useTheme()
  const headerHeight = useHeaderHeight()

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

  const handleBiometryToggle = useCallback(
    (newValue: boolean) => {
      if (newValue === biometryEnabled) return

      onSwitchToggleAllowed()
    },
    [biometryEnabled, onSwitchToggleAllowed]
  )

  const onAuthenticationComplete = useCallback(
    (status: boolean) => {
      // If successfully authenticated the toggle may proceed.
      if (status) {
        const newValue = !biometryEnabled
        setBiometryEnabled(newValue)

        if (newValue) {
          commitWalletToKeychain(newValue).then(() => {
            dispatch({
              type: DispatchAction.USE_BIOMETRY,
              payload: [newValue],
            })
          })
        } else {
          disableBiometrics().then(() => {
            dispatch({
              type: DispatchAction.USE_BIOMETRY,
              payload: [newValue],
            })
          })
        }

        if (
          historyEventsLogger.logToggleBiometry &&
          store.onboarding.didAgreeToTerms &&
          store.onboarding.didConsiderBiometry
        ) {
          const type = HistoryCardType.DeactivateBiometry
          logHistoryRecord(type)
        }
      }
      setCanSeeCheckPIN(false)
    },
    [
      biometryEnabled,
      commitWalletToKeychain,
      disableBiometrics,
      dispatch,
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
    <BiometryControl biometryEnabled={biometryEnabled} onBiometryToggle={handleBiometryToggle}>
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
        <PINVerify
          usage={PINEntryUsage.ChangeBiometrics}
          setAuthenticated={onAuthenticationComplete}
          onCancelAuth={setCanSeeCheckPIN}
        />
      </SafeAreaModal>
    </BiometryControl>
  )
}

export default ToggleBiometry
