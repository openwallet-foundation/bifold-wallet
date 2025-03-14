import { useNavigation, CommonActions } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, View, DeviceEventEmitter, InteractionManager, Pressable } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import KeyboardView from '../components/views/KeyboardView'
import { minPINLength, EventTypes, defaultAutoLockTime, attemptLockoutConfig } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens } from '../types/navigators'
import { hashPIN } from '../utils/crypto'
import { testIdWithKey } from '../utils/testable'
import { InlineErrorType, InlineMessageProps } from '../components/inputs/InlineErrorText'

interface PINEnterProps {
  setAuthenticated: (status: boolean) => void
  usage?: PINEntryUsage
  onCancelAuth?: React.Dispatch<React.SetStateAction<boolean>>
}

export enum PINEntryUsage {
  PINCheck,
  WalletUnlock,
  ChangeBiometrics,
}

const PINEnter: React.FC<PINEnterProps> = ({ setAuthenticated, usage = PINEntryUsage.WalletUnlock, onCancelAuth }) => {
  const { t } = useTranslation()
  const { checkPIN, getWalletCredentials, isBiometricsActive, disableBiometrics } = useAuth()
  const [store, dispatch] = useStore()
  const [PIN, setPIN] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [displayLockoutWarning, setDisplayLockoutWarning] = useState(false)
  const [biometricsErr, setBiometricsErr] = useState(false)
  const navigation = useNavigation()
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false)
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets, PINEnterTheme } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()
  const [
    logger,
    { enableHiddenDevModeTrigger, attemptLockoutConfig: { baseRules, thresholdRules } = attemptLockoutConfig },
  ] = useServices([TOKENS.UTIL_LOGGER, TOKENS.CONFIG])
  const developerOptionCount = useRef(0)
  const touchCountToEnableBiometrics = 9
  const [inlineMessageField, setInlineMessageField] = useState<InlineMessageProps>()
  const [inlineMessages] = useServices([TOKENS.INLINE_ERRORS])
  const [alertModalMessage, setAlertModalMessage] = useState('')
  // Temporary until all use cases are built with the new design
  const isNewDesign = usage === PINEntryUsage.ChangeBiometrics

  const style = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    // below used as helpful labels for views, no properties needed atp
    contentContainer: {},
    controlsContainer: {},
    buttonContainer: {
      width: '100%',
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
    helpText: {
      ...TextTheme.normal,
      alignSelf: 'auto',
      textAlign: 'left',
      marginBottom: isNewDesign ? 40 : 16,
    },
    parenthesisText: {
      ...TextTheme.caption,
    },
    modalText: {
      ...TextTheme.popupModalText,
      marginVertical: 5,
    },
    image: {
      ...PINEnterTheme.image,
      height: Assets.img.logoSecondary.height,
      width: Assets.img.logoSecondary.width,
      resizeMode: Assets.img.logoSecondary.resizeMode,
    },
    title: {
      ...TextTheme.headingTwo,
      marginTop: isNewDesign ? 20 : 0,
      marginBottom: isNewDesign ? 40 : 20,
    },
    subTitle: {
      ...TextTheme.labelSubtitle,
      marginBottom: 20,
    },
    subText: {
      ...TextTheme.bold,
      marginBottom: isNewDesign ? 20 : 4,
    },
  })

  const inputLabelText = {
    [PINEntryUsage.ChangeBiometrics]: t('PINEnter.ChangeBiometricsInputLabel'),
    [PINEntryUsage.PINCheck]: t('PINEnter.AppSettingChangedEnterPIN'),
    [PINEntryUsage.WalletUnlock]: t('PINEnter.EnterPIN'),
  }

  const inputTestId = {
    [PINEntryUsage.ChangeBiometrics]: 'BiometricChangedEnterPIN',
    [PINEntryUsage.PINCheck]: 'AppSettingChangedEnterPIN',
    [PINEntryUsage.WalletUnlock]: 'EnterPIN',
  }

  const primaryButtonText = {
    [PINEntryUsage.ChangeBiometrics]: t('Global.Continue'),
    [PINEntryUsage.PINCheck]: t('PINEnter.AppSettingSave'),
    [PINEntryUsage.WalletUnlock]: t('PINEnter.Unlock'),
  }

  const primaryButtonTestId = {
    [PINEntryUsage.ChangeBiometrics]: 'Continue',
    [PINEntryUsage.PINCheck]: 'AppSettingSave',
    [PINEntryUsage.WalletUnlock]: 'Enter',
  }

  const incrementDeveloperMenuCounter = useCallback(() => {
    if (developerOptionCount.current >= touchCountToEnableBiometrics) {
      developerOptionCount.current = 0
      dispatch({
        type: DispatchAction.ENABLE_DEVELOPER_MODE,
        payload: [true],
      })
      navigation.navigate(Screens.Developer as never)
      return
    }

    developerOptionCount.current = developerOptionCount.current + 1
  }, [dispatch, navigation])

  const gotoPostAuthScreens = useCallback(() => {
    if (store.onboarding.postAuthScreens.length) {
      const screen = store.onboarding.postAuthScreens[0]
      if (screen) {
        navigation.navigate(screen as never)
      }
    }
  }, [store.onboarding.postAuthScreens, navigation])

  const isContinueDisabled = (): boolean => {
    if (inlineMessages.enabled) {
      return !continueEnabled
    }
    return !continueEnabled || PIN.length < minPINLength
  }

  // listen for biometrics error event
  useEffect(() => {
    const handle = DeviceEventEmitter.addListener(EventTypes.BIOMETRY_ERROR, (value?: boolean) => {
      setBiometricsErr((prev) => value ?? !prev)
    })

    return () => {
      handle.remove()
    }
  }, [])

  // This method is used to notify the app that the user is able to receive another lockout penalty
  const unMarkServedPenalty = useCallback(() => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        {
          loginAttempts: store.loginAttempt.loginAttempts,
          lockoutDate: store.loginAttempt.lockoutDate,
          servedPenalty: false,
        },
      ],
    })
  }, [dispatch, store.loginAttempt.loginAttempts, store.loginAttempt.lockoutDate])

  const attemptLockout = useCallback(
    async (penalty: number) => {
      // set the attempt lockout time
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [
          {
            loginAttempts: store.loginAttempt.loginAttempts + 1,
            lockoutDate: Date.now() + penalty,
            servedPenalty: false,
          },
        ],
      })
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.AttemptLockout }],
        })
      )
    },
    [dispatch, navigation, store.loginAttempt.loginAttempts]
  )

  const getLockoutPenalty = useCallback(
    (attempts: number): number | undefined => {
      let penalty = baseRules[attempts]
      if (!penalty && attempts >= thresholdRules.threshold && !(attempts % thresholdRules.increment)) {
        penalty = thresholdRules.thresholdPenaltyDuration
      }
      return penalty
    },
    [baseRules, thresholdRules]
  )

  const loadWalletCredentials = useCallback(async () => {
    if (usage === PINEntryUsage.PINCheck || usage === PINEntryUsage.ChangeBiometrics) {
      return
    }

    const creds = await getWalletCredentials()
    if (creds && creds.key) {
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
  }, [usage, getWalletCredentials, dispatch, setAuthenticated, gotoPostAuthScreens])

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
        const result = await checkPIN(PIN)

        if (store.loginAttempt.servedPenalty) {
          // once the user starts entering their PIN, unMark them as having served their lockout penalty
          unMarkServedPenalty()
        }

        if (!result) {
          const newAttempt = store.loginAttempt.loginAttempts + 1

          const attemptsLeft =
            (thresholdRules.increment - (newAttempt % thresholdRules.increment)) % thresholdRules.increment

          if (!inlineMessages.enabled && !getLockoutPenalty(newAttempt)) {
            // skip displaying modals if we are going to lockout
            setAlertModalVisible(true)
          }
          if (attemptsLeft > 1) {
            if (inlineMessages.enabled) {
              setInlineMessageField({
                message: t('PINEnter.IncorrectPINTries', { tries: attemptsLeft }), // Example: 'Incorrect PIN: 4 tries before timeout'
                inlineType: InlineErrorType.error,
                config: inlineMessages,
              })
            } else {
              setAlertModalMessage(t('PINEnter.IncorrectPINTries', { tries: attemptsLeft }))
            }
          } else if (attemptsLeft === 1) {
            if (inlineMessages.enabled) {
              setInlineMessageField({
                message: t('PINEnter.LastTryBeforeTimeout'), // Show last try warning
                inlineType: InlineErrorType.error,
                config: inlineMessages,
              })
            } else {
              setAlertModalMessage(t('PINEnter.LastTryBeforeTimeout'))
            }
          } else {
            const penalty = getLockoutPenalty(newAttempt)
            if (penalty !== undefined) {
              attemptLockout(penalty) // Only call attemptLockout if penalty is defined
            }
            return
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
      checkPIN,
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
    switch (usage) {
      case PINEntryUsage.PINCheck:
        setAlertModalVisible(false)
        setAuthenticated(false)
        break
      case PINEntryUsage.ChangeBiometrics:
        setAlertModalVisible(false)
        setAuthenticated(false)
        break

      default:
        setAlertModalVisible(false)

        break
    }

    setAlertModalVisible(false)
  }, [usage, setAuthenticated])

  const verifyPIN = useCallback(
    async (PIN: string) => {
      try {
        const credentials = await getWalletCredentials()
        if (!credentials) {
          throw new Error('Problem')
        }

        const key = await hashPIN(PIN, credentials.salt)

        if (credentials.key !== key) {
          setAlertModalVisible(true)

          return
        }

        setAuthenticated(true)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1042'),
          t('Error.Message1042'),
          (err as Error)?.message ?? err,
          1042
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    },
    [getWalletCredentials, setAuthenticated, t]
  )

  // both of the async functions called in this function are completely wrapped in trycatch
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

      if (usage === PINEntryUsage.PINCheck || usage === PINEntryUsage.ChangeBiometrics) {
        await verifyPIN(PIN)
      }

      if (usage === PINEntryUsage.WalletUnlock) {
        await unlockWalletWithPIN(PIN)
      }
    },
    [usage, verifyPIN, unlockWalletWithPIN, t, inlineMessages]
  )

  const displayHelpText = useCallback(() => {
    if (store.lockout.displayNotification) {
      return (
        <>
          <Text style={style.helpText}>
            {t('PINEnter.LockedOut', { time: String(store.preferences.autoLockTime ?? defaultAutoLockTime) })}
          </Text>
          <Text style={style.helpText}>{t('PINEnter.ReEnterPIN')}</Text>
        </>
      )
    }

    if (biometricsEnrollmentChange) {
      return (
        <>
          <Text style={style.helpText}>{t('PINEnter.BiometricsChanged')}</Text>
          <Text style={style.helpText}>{t('PINEnter.BiometricsChangedEnterPIN')}</Text>
        </>
      )
    }

    if (biometricsErr) {
      return (
        <>
          <Text style={style.helpText}>{t('PINEnter.BiometricsError')}</Text>
          <Text style={style.helpText}>{t('PINEnter.BiometricsErrorEnterPIN')}</Text>
        </>
      )
    }

    if (usage === PINEntryUsage.PINCheck) {
      return <Text style={style.helpText}>{t('PINEnter.AppSettingChanged')}</Text>
    }

    if (usage === PINEntryUsage.ChangeBiometrics) {
      return (
        <>
          <Text style={style.title}>{t('PINEnter.ChangeBiometricsHeader')}</Text>
          <Text style={style.helpText}>{t('PINEnter.ChangeBiometricsSubtext')}</Text>
        </>
      )
    }

    return (
      <>
        <Text style={style.title}>{t('PINEnter.Title')}</Text>
        <Text style={style.subTitle}>{t('PINEnter.SubText')}</Text>
      </>
    )
  }, [
    store.lockout.displayNotification,
    style.helpText,
    t,
    biometricsEnrollmentChange,
    biometricsErr,
    style.subTitle,
    style.title,
    store.preferences.autoLockTime,
    usage,
  ])

  return (
    <KeyboardView>
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          {usage === PINEntryUsage.WalletUnlock && enableHiddenDevModeTrigger ? (
            <Pressable onPress={incrementDeveloperMenuCounter} testID={testIdWithKey('DeveloperCounter')}>
              {displayHelpText()}
            </Pressable>
          ) : (
            displayHelpText()
          )}
          <Text style={style.subText}>
            {inputLabelText[usage]}
            {usage === PINEntryUsage.ChangeBiometrics && <Text style={style.parenthesisText}>{` `}{t('PINEnter.ChangeBiometricsInputLabelParenthesis')}</Text>}
          </Text>
          <PINInput
            onPINChanged={(p: string) => {
              setPIN(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
              }
            }}
            testID={testIdWithKey(inputTestId[usage])}
            accessibilityLabel={inputLabelText[usage]}
            autoFocus={true}
            inlineMessage={inlineMessageField}
          />
        </View>
        <View style={style.controlsContainer}>
          <View style={style.buttonContainer}>
            <Button
              title={primaryButtonText[usage]}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey(primaryButtonTestId[usage])}
              disabled={isContinueDisabled()}
              accessibilityLabel={primaryButtonText[usage]}
              onPress={() => {
                Keyboard.dismiss()
                onPINInputCompleted(PIN)
              }}
            >
              {!continueEnabled && <ButtonLoading />}
            </Button>
          </View>

          {store.preferences.useBiometry && usage === PINEntryUsage.WalletUnlock && (
            <>
              <Text style={[TextTheme.normal, { alignSelf: 'center', marginTop: 10 }]}>{t('PINEnter.Or')}</Text>
              <View style={[style.buttonContainer, { marginTop: 10 }]}>
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

          {usage === PINEntryUsage.PINCheck && (
            <View style={[style.buttonContainer, { marginTop: 10 }]}>
              <Button
                title={t('PINEnter.AppSettingCancel')}
                buttonType={ButtonType.Secondary}
                testID={testIdWithKey('AppSettingCancel')}
                accessibilityLabel={t('PINEnter.AppSettingCancel')}
                onPress={() => onCancelAuth?.(false)}
              />
            </View>
          )}
        </View>
      </View>
      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.modalText}>{alertModalMessage}</Text>
              {displayLockoutWarning ? (
                <Text style={style.modalText}>{t('PINEnter.AttemptLockoutWarning')}</Text>
              ) : null}
            </View>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={clearAlertModal}
        />
      )}
    </KeyboardView>
  )
}

export default PINEnter
