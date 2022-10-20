import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, Keyboard, StyleSheet, Text, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import AlertModal from '../components/modals/AlertModal'
import PopupModal from '../components/modals/PopupModal'
import { attemptLockoutBaseRules, attemptLockoutThresholdRules } from '../constants'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { StoreContext, useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { Screens } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PinEnterProps {
  setAuthenticated: GenericFn
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated }) => {
  const { t } = useTranslation()
  const { checkPIN, getWalletCredentials, isBiometricsActive, disableBiometrics } = useAuth()
  const [, dispatch] = useStore()
  const [pin, setPin] = useState<string>('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [displayLockoutWarning, setDisplayLockoutWarning] = useState(false)
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [biometricsEnrollmentChange, setBiometricsEnrollmentChange] = useState<boolean>(false)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [state] = useContext(StoreContext)

  const style = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
  })

  // This method is used to notify the app that the user is able to receive another lockout penalty
  const unMarkServedPenalty = () => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        {
          loginAttempts: state.loginAttempt.loginAttempts,
          lockoutDate: state.loginAttempt.lockoutDate,
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
        { loginAttempts: state.loginAttempt.loginAttempts, lockoutDate: Date.now() + penalty, servedPenalty: false },
      ],
    })
    navigation.navigate(Screens.AttemptLockout as never)
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
    const creds = await getWalletCredentials()
    if (creds && creds.key) {
      //remove lockout notification
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: false }],
      })

      // reset login attempts if login is successful
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [{ loginAttempts: 0 }],
      })
      setAuthenticated()
    }
  }

  useEffect(() => {
    if (!state.preferences.useBiometry) {
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

    loadWalletCredentials().catch((error: unknown) => {
      // TODO:(jl) Handle error
    })
  }, [])

  useEffect(() => {
    // check number of login attempts and determine if app should apply lockout
    const attempts = state.loginAttempt.loginAttempts
    const penalty = getLockoutPenalty(attempts)
    if (penalty && !state.loginAttempt.servedPenalty) {
      // only apply lockout if user has not served their penalty
      attemptLockout(penalty)
    }

    // display warning if we are one away from a lockout
    const displayWarning = !!getLockoutPenalty(attempts + 1)
    setDisplayLockoutWarning(displayWarning)
  }, [state.loginAttempt.loginAttempts])

  const onPinInputCompleted = async (pin: string) => {
    try {
      setContinueEnabled(false)
      const result = await checkPIN(pin)

      if (state.loginAttempt.servedPenalty) {
        // once the user starts entering their PIN, unMark them as having served their lockout penalty
        unMarkServedPenalty()
      }

      if (!result) {
        const newAttempt = state.loginAttempt.loginAttempts + 1
        if (!getLockoutPenalty(newAttempt)) {
          // skip displaying modals if we are going to lockout
          setModalVisible(true)
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
      setAuthenticated()
      return
    } catch (error: unknown) {
      // TODO:(jl) process error
    }
  }

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={
          Platform.OS === 'android' || pinEntryUsage === PinEntryUsage.PinCheck
            ? StatusBarStyles.Light
            : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
      <View style={[style.container]}>
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
              {t('PinEnter.BiometricsChanged')}
            </Text>
            <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>
              {t('PinEnter.BiometricsChangedEnterPIN')}
            </Text>
          </>
        ) : (
          <Text style={[TextTheme.normal, { alignSelf: 'center', marginBottom: 16 }]}>{t('PinEnter.EnterPIN')}</Text>
        )}
        <PinInput
          onPinChanged={setPin}
          testID={testIdWithKey('EnterPIN')}
          accessibilityLabel={t('PinEnter.EnterPIN')}
          autoFocus={true}
        />
        {modalVisible && (
          <AlertModal title={t('PinEnter.IncorrectPIN')} message="" submit={() => setModalVisible(false)} />
        )}
        {state.lockout.displayNotification && (
          <PopupModal
            notificationType={InfoBoxType.Info}
            title={t('PinEnter.LoggedOut')}
            bodyContent={
              <View>
                <Text style={style.notifyText}>{t('PinEnter.LoggedOutDescription')}</Text>
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
      </View>
      <View style={{ marginTop: 'auto', margin: 20, marginBottom: 10 }}>
        <Button
          title={t('PinEnter.Unlock')}
          buttonType={ButtonType.Primary}
          testID={testIdWithKey('Enter')}
          disabled={!continueEnabled}
          accessibilityLabel={t('PinEnter.Unlock')}
          onPress={() => {
            Keyboard.dismiss()
            onPinInputCompleted(pin)
          }}
        />
      </View>

      {state.preferences.useBiometry && (
        <>
          <Text style={[TextTheme.normal, { alignSelf: 'center' }]}>{t('PinEnter.Or')}</Text>
          <View style={{ margin: 20, marginTop: 10 }}>
            <Button
              title={t('PinEnter.BiometricsUnlock')}
              buttonType={ButtonType.Secondary}
              testID={testIdWithKey('Enter')}
              disabled={!continueEnabled}
              accessibilityLabel={t('PinEnter.BiometricsUnlock')}
              onPress={loadWalletCredentials}
            />
          </View>
        </>
      )}

      {modalVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('PinEnter.IncorrectPIN')}
          bodyContent={
            <View>
              <Text style={style.notifyText}>{t('PinEnter.RepeatPIN')}</Text>
              {displayLockoutWarning ? (
                <Text style={style.notifyText}>{t('PinEnter.AttemptLockoutWarning')}</Text>
              ) : null}
            </View>
          }
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={() => setModalVisible(false)}
        />
      )}
    </SafeAreaView>
  )
}

export default PinEnter
