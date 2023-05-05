import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar, Keyboard, StyleSheet, Text, Image, View, DeviceEventEmitter } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import PINInput from '../components/inputs/PINInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import KeyboardView from '../components/views/KeyboardView'
import { minPINLength, attemptLockoutBaseRules, attemptLockoutThresholdRules, EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { hashPIN } from '../utils/crypto'
import { StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PINEnterProps {
  setAuthenticated: (status: boolean) => void
  usage?: PINEntryUsage
}

export enum PINEntryUsage {
  PINCheck,
  WalletUnlock,
}

const PINEnter: React.FC<PINEnterProps> = ({ setAuthenticated, usage = PINEntryUsage.WalletUnlock }) => {
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
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const { ButtonLoading } = useAnimatedComponents()

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
    modalText: {
      ...TextTheme.modalNormal,
      marginVertical: 5,
    },
  })

  // listen for biometrics error event
  useEffect(() => {
    const handle = DeviceEventEmitter.addListener(EventTypes.BIOMETRY_ERROR, (value?: boolean) => {
      const newVal = value === undefined ? !biometricsErr : value
      setBiometricsErr(newVal)
    })

    return () => {
      handle.remove()
    }
  }, [])

  // This method is used to notify the app that the user is able to receive another lockout penalty
  const unMarkServedPenalty = () => {
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
  }

  const attemptLockout = async (penalty: number) => {
    // set the attempt lockout time
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        { loginAttempts: store.loginAttempt.loginAttempts, lockoutDate: Date.now() + penalty, servedPenalty: false },
      ],
    })
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: Screens.AttemptLockout }],
      })
    )
  }

  const getLockoutPenalty = (attempts: number): number | undefined => {
    let penalty = attemptLockoutBaseRules[attempts]
    if (
      !penalty &&
      attempts >= attemptLockoutThresholdRules.attemptThreshold &&
      !(attempts % attemptLockoutThresholdRules.attemptIncrement)
    ) {
      penalty = attemptLockoutThresholdRules.attemptPenalty
    }
    return penalty
  }

  const loadWalletCredentials = async () => {
    if (usage === PINEntryUsage.PINCheck) {
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
    }
  }

  useEffect(() => {
    if (!store.preferences.useBiometry) {
      return
    }

    isBiometricsActive().then((res) => {
      if (!res) {
        // biometry state has changed, display message and disable biometry
        setBiometricsEnrollmentChange(true)
        disableBiometrics()
        dispatch({
          type: DispatchAction.USE_BIOMETRY,
          payload: [false],
        })
      }
    })

    loadWalletCredentials().catch(() => {
      // TODO:(jl) Handle error
    })
  }, [])

  useEffect(() => {
    // check number of login attempts and determine if app should apply lockout
    const attempts = store.loginAttempt.loginAttempts
    const penalty = getLockoutPenalty(attempts)
    if (penalty && !store.loginAttempt.servedPenalty) {
      // only apply lockout if user has not served their penalty
      attemptLockout(penalty)
    }

    // display warning if we are one away from a lockout
    const displayWarning = !!getLockoutPenalty(attempts + 1)
    setDisplayLockoutWarning(displayWarning)
  }, [store.loginAttempt.loginAttempts])

  const unlockWalletWithPIN = async (PIN: string) => {
    try {
      setContinueEnabled(false)
      const result = await checkPIN(PIN)

      if (store.loginAttempt.servedPenalty) {
        // once the user starts entering their PIN, unMark them as having served their lockout penalty
        unMarkServedPenalty()
      }

      if (!result) {
        const newAttempt = store.loginAttempt.loginAttempts + 1
        if (!getLockoutPenalty(newAttempt)) {
          // skip displaying modals if we are going to lockout
          setAlertModalVisible(true)
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

      setAuthenticated(true)
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  const clearAlertModal = () => {
    switch (usage) {
      case PINEntryUsage.PINCheck:
        setAlertModalVisible(false)
        setAuthenticated(false)
        break

      default:
        setAlertModalVisible(false)

        break
    }

    setAlertModalVisible(false)
  }

  const verifyPIN = async (PIN: string) => {
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
    } catch (error) {
      //TODO:(jl)
    }
  }

  const onPINInputCompleted = async (PIN: string) => {
    try {
      setContinueEnabled(false)

      if (usage === PINEntryUsage.PINCheck) {
        await verifyPIN(PIN)
      }

      if (usage === PINEntryUsage.WalletUnlock) {
        await unlockWalletWithPIN(PIN)
      }
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  return (
    <KeyboardView>
      <StatusBar barStyle={StatusBarStyles.Light} />
      <View style={style.screenContainer}>
        <View style={style.contentContainer}>
          <Image
            source={Assets.img.logoSecondary.src}
            style={{
              height: Assets.img.logoSecondary.height,
              width: Assets.img.logoSecondary.width,
              resizeMode: Assets.img.logoSecondary.resizeMode,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />
          {biometricsEnrollmentChange ? (
            <>
              <Text style={[TextTheme.normal, { alignSelf: 'center', textAlign: 'center' }]}>
                {t('PINEnter.BiometricsChanged')}
              </Text>
              <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>
                {t('PINEnter.BiometricsChangedEnterPIN')}
              </Text>
            </>
          ) : biometricsErr ? (
            <>
              <Text style={[TextTheme.normal, { alignSelf: 'center' }]}>{t('PINEnter.BiometricsError')}</Text>
              <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>
                {t('PINEnter.BiometricsErrorEnterPIN')}
              </Text>
            </>
          ) : (
            <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>{t('PINEnter.EnterPIN')}</Text>
          )}
          <PINInput
            onPINChanged={(p: string) => {
              setPIN(p)
              if (p.length === minPINLength) {
                Keyboard.dismiss()
              }
            }}
            testID={testIdWithKey('EnterPIN')}
            accessibilityLabel={t('PINEnter.EnterPIN')}
            autoFocus={true}
          />
        </View>
        {store.lockout.displayNotification && (
          <PopupModal
            notificationType={InfoBoxType.Info}
            title={t('PINEnter.LoggedOut')}
            bodyContent={
              <View>
                <Text style={style.modalText}>{t('PINEnter.LoggedOutDescription')}</Text>
              </View>
            }
            onCallToActionLabel={t('Global.Okay')}
            onCallToActionPressed={() => {
              dispatch({
                type: DispatchAction.LOCKOUT_UPDATED,
                payload: [{ displayNotification: false }],
              })
            }}
          />
        )}
        <View style={style.controlsContainer}>
          <View style={style.buttonContainer}>
            <Button
              title={t('PINEnter.Unlock')}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey('Enter')}
              disabled={!continueEnabled}
              accessibilityLabel={t('PINEnter.Unlock')}
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
                  testID={testIdWithKey('Enter')}
                  disabled={!continueEnabled}
                  accessibilityLabel={t('PINEnter.BiometricsUnlock')}
                  onPress={loadWalletCredentials}
                />
              </View>
            </>
          )}
        </View>
      </View>
      {alertModalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PINEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.modalText}>{t('PINEnter.RepeatPIN')}</Text>
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
