import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, InteractionManager, Keyboard, Pressable, StyleSheet, Vibration, View } from 'react-native'

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
import { useGotoPostAuthScreens } from '../hooks/onboarding'
import usePreventScreenCapture from '../hooks/screen-capture'
import { BifoldError } from '../types/error'
import { testIdWithKey } from '../utils/testable'
import { getBuildNumber, getVersion } from 'react-native-device-info'

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
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState(false)
  const { ColorPallet, TextTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const [
    logger,
    {
      preventScreenCapture,
      enableHiddenDevModeTrigger,
      attemptLockoutConfig: { thresholdRules } = attemptLockoutConfig,
    },
  ] = useServices([TOKENS.UTIL_LOGGER, TOKENS.CONFIG])
  const [inlineMessageField, setInlineMessageField] = useState<InlineMessageProps>()
  const [inlineMessages] = useServices([TOKENS.INLINE_ERRORS])
  const [alertModalMessage, setAlertModalMessage] = useState('')
  const { getLockoutPenalty, attemptLockout, unMarkServedPenalty } = useLockout()
  const onBackPressed = () => setDevModalVisible(false)
  const onDevModeTriggered = () => {
    Vibration.vibrate()
    setDevModalVisible(true)
  }
  const { incrementDeveloperMenuCounter } = useDeveloperMode(onDevModeTriggered)
  const gotoPostAuthScreens = useGotoPostAuthScreens()
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
      gotoPostAuthScreens()
    }
  }, [getWalletSecret, dispatch, setAuthenticated, gotoPostAuthScreens])

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(async () => {
      if (!store.preferences.useBiometry) {
        return
      }
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
        logger.error(`error checking biometrics / loading credentials: ${JSON.stringify(error)}`)
      }
    })

    return handle.cancel
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
            setInlineMessageField({
              message,
              inlineType: InlineErrorType.error,
              config: inlineMessages,
            })
          } else {
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
        gotoPostAuthScreens()
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
      gotoPostAuthScreens,
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
      backgroundColor: ColorPallet.brand.primaryBackground,
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
      color: ColorPallet.brand.link,
      fontSize: 20,
    },
    buildNumberText: {
      fontSize: 14,
      color: TextTheme.labelSubtitle.color,
      textAlign: 'center',
      marginTop: 20,
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
        <ThemedText variant={showHelpText ? 'normal' : 'headingThree'} style={style.helpText}>
          {header}
        </ThemedText>
        <ThemedText variant={showHelpText ? 'normal' : 'labelSubtitle'} style={style.helpText}>
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
  ])

  return (
    <KeyboardView keyboardAvoiding={false}>
      <View style={style.screenContainer}>
        <View>
          <Pressable
            onPress={enableHiddenDevModeTrigger ? incrementDeveloperMenuCounter : () => {}}
            testID={testIdWithKey('DeveloperCounter')}
          >
            {HelpText}
          </Pressable>
          <ThemedText variant="bold" style={style.inputLabel}>
            {t('PINEnter.EnterPIN')}
          </ThemedText>
          <PINInput
            onPINChanged={(p: string) => {
              setPIN(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
                onPINInputCompleted(p)
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINEnter.EnterPIN')}
            autoFocus={true}
            inlineMessage={inlineMessageField}
            onSubmitEditing={() => {
              onPINInputCompleted(PIN)
            }}
          />
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
        </View>
        <View>
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
