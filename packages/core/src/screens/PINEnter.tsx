import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import {
  AppState,
  DeviceEventEmitter,
  InteractionManager,
  Keyboard,
  Pressable,
  StyleSheet,
  Vibration,
  View,
} from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { InlineErrorType, InlineMessageProps } from '../components/inputs/InlineErrorText'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import DeveloperModal from '../components/modals/DeveloperModal'
import PopupModal from '../components/modals/PopupModal'
import { ThemedText } from '../components/texts/ThemedText'
import KeyboardView from '../components/views/KeyboardView'
import { EventTypes, attemptLockoutConfig, defaultAutoLockTime, minPINLength } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useDeveloperMode } from '../hooks/developer-mode'
import { useLockout } from '../hooks/lockout'
import usePreventScreenCapture from '../hooks/screen-capture'
import { BifoldError } from '../types/error'
import { testIdWithKey } from '../utils/testable'

interface PINEnterProps {
  setAuthenticated: (status: boolean) => void
}

const PINEnter: React.FC<PINEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const { checkWalletPIN, getWalletSecret, isBiometricsActive, disableBiometrics } = useAuth()
  const [store, dispatch] = useStore()
  const [PIN, setPIN] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [displayLockoutWarning, setDisplayLockoutWarning] = useState(false)
  const [biometricsErr, setBiometricsErr] = useState(false)
  const [alertModalVisible, setAlertModalVisible] = useState(false)
  const [forgotPINModalVisible, setForgotPINModalVisible] = useState(false)
  const [devModalVisible, setDevModalVisible] = useState(false)
  const [showForgotPINMessage, setShowForgotPINMessage] = useState(false)
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState(false)
  const { ColorPalette, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const [
    logger,
    {
      preventScreenCapture,
      enableHiddenDevModeTrigger,
      attemptLockoutConfig: { thresholdRules } = attemptLockoutConfig,
      PINScreensConfig,
    },
    inlineMessages,
  ] = useServices([TOKENS.UTIL_LOGGER, TOKENS.CONFIG, TOKENS.INLINE_ERRORS])
  const [inlineMessageField, setInlineMessageField] = useState<InlineMessageProps>()
  const [alertModalMessage, setAlertModalMessage] = useState('')
  const { getLockoutPenalty, attemptLockout, unMarkServedPenalty } = useLockout()
  const onBackPressed = () => setDevModalVisible(false)
  const onDevModeTriggered = () => {
    Vibration.vibrate()
    setDevModalVisible(true)
  }
  const { incrementDeveloperMenuCounter } = useDeveloperMode(onDevModeTriggered)
  const isContinueDisabled = inlineMessages.enabled ? !continueEnabled : !continueEnabled || PIN.length < minPINLength
  usePreventScreenCapture(preventScreenCapture)

  // listen for biometrics error event
  useEffect(() => {
    const handle = DeviceEventEmitter.addListener(EventTypes.BIOMETRY_ERROR, (value?: boolean) => {
      setBiometricsErr((prev) => value ?? !prev)
    })
    return () => {
      handle.remove()
    }
  }, [])

  const loadWalletCredentials = useCallback(async () => {
    const walletSecret = await getWalletSecret()
    if (walletSecret) {
      // remove lockout notification
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: false }],
      })
      // reset login attempts if login is successful
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })
      setAuthenticated(true)
    }
  }, [getWalletSecret, dispatch, setAuthenticated])

  useEffect(() => {
    // Only check biometrics if user has it enabled
    if (!store.preferences.useBiometry) {
      return
    }

    const checkBiometrics = async () => {
      try {
        const active = await isBiometricsActive()

        if (!active) {
          // biometry state has changed, display message and disable biometry
          setBiometricsEnrollmentChange(true)
          await disableBiometrics()
          dispatch({
            type: DispatchAction.USE_BIOMETRY,
            payload: [false],
          })
        }

        await loadWalletCredentials()
      } catch (error) {
        logger.error('error checking biometrics / loading credentials', error as Error)
      }
    }

    // On mount, check biometrics after interactions complete
    let afterInteractionsBiometricsHandler = InteractionManager.runAfterInteractions(checkBiometrics)

    // Re-check biometrics when app transitions from background (inactive) to foreground (active)
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Cancel any existing interaction handler before scheduling a new one
        afterInteractionsBiometricsHandler.cancel()
        afterInteractionsBiometricsHandler = InteractionManager.runAfterInteractions(checkBiometrics)
      }
    })

    return () => {
      // Cleanup listeners and handlers on unmount
      afterInteractionsBiometricsHandler.cancel()
      appStateListener.remove()
    }
  }, [store.preferences.useBiometry, isBiometricsActive, disableBiometrics, dispatch, loadWalletCredentials, logger])

  useEffect(() => {
    // check number of login attempts and determine if app should apply lockout
    const attempts = store.loginAttempt.loginAttempts
    // display warning if we are one away from a lockout
    const displayWarning = !!getLockoutPenalty(attempts + 1)
    setDisplayLockoutWarning(displayWarning)
  }, [store.loginAttempt.loginAttempts, getLockoutPenalty])

  useEffect(() => {
    setInlineMessageField(undefined)
  }, [PIN])

  const unlockWalletWithPIN = useCallback(
    async (PIN: string) => {
      try {
        setContinueEnabled(false)
        const result = await checkWalletPIN(PIN)
        if (store.loginAttempt.servedPenalty) {
          // once the user starts entering their PIN, unMark them as having served their
          // lockout penalty
          unMarkServedPenalty()
        }
        if (!result) {
          const newAttempt = store.loginAttempt.loginAttempts + 1
          let message = ''
          const attemptsLeft =
            (thresholdRules.increment - (newAttempt % thresholdRules.increment)) % thresholdRules.increment
          if (!inlineMessages.enabled && !getLockoutPenalty(newAttempt)) {
            // skip displaying modals if we are going to lockout
            setAlertModalVisible(true)
          }
          if (attemptsLeft > 1) {
            message = t('PINEnter.IncorrectPINTries', { tries: attemptsLeft })
          } else if (attemptsLeft === 1) {
            message = t('PINEnter.LastTryBeforeTimeout')
          } else {
            const penalty = getLockoutPenalty(newAttempt)
            if (penalty !== undefined) {
              attemptLockout(penalty) // Only call attemptLockout if penalty is defined
            }
            setContinueEnabled(true)
            return
          }
          if (inlineMessages.enabled) {
            setShowForgotPINMessage(true)
            setInlineMessageField({
              message,
              inlineType: InlineErrorType.error,
              config: inlineMessages,
            })
          } else {
            setShowForgotPINMessage(true)
            setAlertModalMessage(message)
          }
          setContinueEnabled(true)
          // log incorrect login attempts
          dispatch({
            type: DispatchAction.ATTEMPT_UPDATED,
            payload: [{ loginAttempts: newAttempt }],
          })
          return
        }
        // reset login attempts if login is successful
        dispatch({
          type: DispatchAction.ATTEMPT_UPDATED,
          payload: [{ loginAttempts: 0 }],
        })
        // remove lockout notification if login is successful
        dispatch({
          type: DispatchAction.LOCKOUT_UPDATED,
          payload: [{ displayNotification: false }],
        })
        setAuthenticated(true)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1041'),
          t('Error.Message1041'),
          (err as Error)?.message ?? err,
          1041
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [
      checkWalletPIN,
      store.loginAttempt,
      unMarkServedPenalty,
      getLockoutPenalty,
      dispatch,
      setAuthenticated,
      t,
      attemptLockout,
      inlineMessages,
      thresholdRules.increment,
    ]
  )

  const clearAlertModal = useCallback(() => {
    setAlertModalVisible(false)
  }, [setAlertModalVisible])

  // both of the async functions called in this function are completely wrapped in try catch
  const onPINInputCompleted = useCallback(
    async (PIN: string) => {
      if (inlineMessages.enabled && PIN.length < minPINLength) {
        setInlineMessageField({
          message: t('PINCreate.PINTooShort'),
          inlineType: InlineErrorType.error,
          config: inlineMessages,
        })
        return
      }
      setContinueEnabled(false)
      await unlockWalletWithPIN(PIN)
    },
    [unlockWalletWithPIN, t, inlineMessages]
  )

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      padding: 20,
      justifyContent: 'space-between',
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    buttonContainer: {
      width: '100%',
    },
    biometricsButtonContainer: {
      width: '100%',
      marginTop: 10,
    },
    biometricsText: {
      alignSelf: 'center',
      marginTop: 10,
    },
    helpText: {
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: PINScreensConfig.useNewPINDesign ? 24 : 16,
    },
    helpTextSubtitle: {
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: 16,
    },
    inputLabel: {
      marginBottom: 16,
    },
    modalText: {
      marginVertical: 5,
    },
    subTitle: {
      marginBottom: 20,
    },
    forgotPINText: {
      fontSize: PINScreensConfig.useNewPINDesign ? 16 : 20,
      textAlign: PINScreensConfig.useNewPINDesign ? 'center' : 'left',
      color: PINScreensConfig.useNewPINDesign ? '' : ColorPalette.brand.link,
    },
    buildNumberText: {
      fontSize: 14,
      color: TextTheme.labelSubtitle.color,
      textAlign: 'center',
      marginTop: 20,
    },
    appTitle: {
      marginTop: 16,
      marginBottom: 24,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  const HelpText = useMemo(() => {
    const showHelpText = store.lockout.displayNotification || biometricsEnrollmentChange || biometricsErr
    let header = t('PINEnter.Title')
    let subheader = t('PINEnter.SubText')
    if (store.lockout.displayNotification) {
      header = t('PINEnter.LockedOut', { time: String(store.preferences.autoLockTime ?? defaultAutoLockTime) })
      subheader = t('PINEnter.ReEnterPIN')
    }
    if (biometricsEnrollmentChange) {
      header = t('PINEnter.BiometricsChanged')
      subheader = t('PINEnter.BiometricsChangedEnterPIN')
    }
    if (biometricsErr) {
      header = t('PINEnter.BiometricsError')
      subheader = t('PINEnter.BiometricsErrorEnterPIN')
    }
    return (
      <>
        <ThemedText
          variant={showHelpText ? 'normal' : 'headingThree'}
          style={PINScreensConfig.useNewPINDesign ? style.helpText : style.helpTextSubtitle}
        >
          {header}
        </ThemedText>
        <ThemedText
          variant={PINScreensConfig.useNewPINDesign ? 'normal' : 'labelSubtitle'}
          style={PINScreensConfig.useNewPINDesign ? style.helpTextSubtitle : style.helpText}
        >
          {subheader}
        </ThemedText>
      </>
    )
  }, [
    style.helpText,
    store.lockout.displayNotification,
    t,
    biometricsEnrollmentChange,
    biometricsErr,
    store.preferences.autoLockTime,
    style.helpTextSubtitle,
    PINScreensConfig.useNewPINDesign,
  ])

  return (
    <KeyboardView keyboardAvoiding={true}>
      <View style={style.screenContainer}>
        <View>
          {PINScreensConfig.useNewPINDesign && (
            <ThemedText variant="bold" style={style.appTitle}>
              {t('PINEnter.AppTitle')}
            </ThemedText>
          )}
          <Pressable
            onPress={enableHiddenDevModeTrigger ? incrementDeveloperMenuCounter : () => {}}
            testID={testIdWithKey('DeveloperCounter')}
          >
            {HelpText}
          </Pressable>
          {!PINScreensConfig.useNewPINDesign && (
            <ThemedText variant="bold" style={style.inputLabel}>
              {t('PINEnter.EnterPIN')}
            </ThemedText>
          )}
          <PINInput
            onPINChanged={(userPinInput: string) => {
              setPIN(userPinInput)
              if (userPinInput.length === minPINLength) {
                Keyboard.dismiss()
                onPINInputCompleted(userPinInput)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINEnter.EnterPIN')}
            autoFocus={true}
            inlineMessage={inlineMessageField}
            onSubmitEditing={(userPinInput: string) => {
              onPINInputCompleted(userPinInput)
            }}
          />
          {!PINScreensConfig.useNewPINDesign && (
            <ThemedText
              variant="bold"
              style={style.forgotPINText}
              onPress={() => setForgotPINModalVisible(true)}
              testID={testIdWithKey('ForgotPINLink')}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={t('PINEnter.ForgotPINLink')}
            >
              {t('PINEnter.ForgotPINLink')}
            </ThemedText>
          )}
          {showForgotPINMessage && PINScreensConfig.useNewPINDesign && (
            <ThemedText
              variant="normal"
              style={style.forgotPINText}
              testID={testIdWithKey('ForgotPINDescription')}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={t('PINEnter.ForgotPINModalDescription')}
            >
              {t('PINEnter.ForgotPINModalDescription')}
            </ThemedText>
          )}
        </View>
        {PINScreensConfig.useNewPINDesign && !continueEnabled && (
          <View style={style.loadingContainer}>
            <ButtonLoading size={50} />
            <ThemedText variant="normal">{t('PINEnter.Loading')}</ThemedText>
          </View>
        )}
        <View>
          {!PINScreensConfig.useNewPINDesign && (
            <View style={style.buttonContainer}>
              <Button
                title={t('PINEnter.Unlock')}
                buttonType={ButtonType.Primary}
                testID={testIdWithKey('Enter')}
                disabled={isContinueDisabled}
                accessibilityLabel={t('PINEnter.Unlock')}
                onPress={() => {
                  Keyboard.dismiss()
                  onPINInputCompleted(PIN)
                }}
              >
                {!continueEnabled && <ButtonLoading />}
              </Button>
            </View>
          )}
          {store.preferences.useBiometry && (
            <>
              <ThemedText style={style.biometricsText}>{t('PINEnter.Or')}</ThemedText>
              <View style={style.biometricsButtonContainer}>
                <Button
                  title={t('PINEnter.BiometricsUnlock')}
                  buttonType={ButtonType.Secondary}
                  testID={testIdWithKey('BiometricsUnlock')}
                  disabled={!continueEnabled}
                  accessibilityLabel={t('PINEnter.BiometricsUnlock')}
                  onPress={loadWalletCredentials}
                />
              </View>
            </>
          )}
          <ThemedText testID={testIdWithKey('Version')} style={style.buildNumberText}>
            {`${t('Settings.Version')} ${getVersion()} ${t('Settings.Build')} (${getBuildNumber()})`}
          </ThemedText>
        </View>
      </View>
      {alertModalVisible ? (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.IncorrectPIN')}
          bodyContent={
            <>
              <ThemedText variant="popupModalText" style={style.modalText}>
                {alertModalMessage}
              </ThemedText>
              {displayLockoutWarning ? (
                <ThemedText variant="popupModalText" style={style.modalText}>
                  {t('PINEnter.AttemptLockoutWarning')}
                </ThemedText>
              ) : null}
            </>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={clearAlertModal}
        />
      ) : null}
      {forgotPINModalVisible ? (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.ForgotPINModalTitle')}
          bodyContent={
            <ThemedText
              variant="popupModalText"
              style={style.modalText}
              testID={testIdWithKey('ForgotPINModalDescription')}
            >
              {t('PINEnter.ForgotPINModalDescription')}
            </ThemedText>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => setForgotPINModalVisible(false)}
        />
      ) : null}
      {devModalVisible ? <DeveloperModal onBackPressed={onBackPressed} /> : null}
    </KeyboardView>
  )
}

export default PINEnter
