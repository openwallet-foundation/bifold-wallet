import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { minPINLength } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { PinSecurityLevel } from '../types/security'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

const consecutiveNumber = new RegExp(/(\d)\1{1,}/) // 2 or more consecutive digits
const consecutiveSeries = new RegExp(/012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210/) // 3 or more consecutive digits
const evenNumberSeries = new RegExp('^d*[13579]$')
const OddNumberSeries = new RegExp('^d*[02468]$')
const consecutiveTwoNumber = new RegExp('([0-9]*[0-9])\\1+')
const isNumber = new RegExp('^[0-9]+$')
const crossNumberPattern = ['159753', '159357', '951357', '951753', '357159', '357951', '753159', '753951']

interface PinCreateProps {
  setAuthenticated: (status: boolean) => void
}

interface ModalState {
  visible: boolean
  title: string
  message: string
}

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const { setPIN } = useAuth()
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const [continueEnabled, setContinueEnabled] = useState(true)
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { pinSecurity } = useConfiguration()

  const { ColorPallet, TextTheme } = useTheme()
  const style = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
  })

  const passcodeCreate = async (pin: string) => {
    // TODO: Update this
    try {
      setContinueEnabled(false)
      await setPIN(pin)
      // This will trigger initAgent
      setAuthenticated(true)

      dispatch({
        type: DispatchAction.DID_CREATE_PIN,
      })

      // TODO: Navigate back if in settings
      navigation.navigate(Screens.UseBiometry)
    } catch (e) {
      // TODO:(jl)
    }
  }

  const confirmEntry = async (x: string, y: string) => {
    const negativePattern = /[^0-9]/g
    if (negativePattern.test(x)) {
      setModalState({
        visible: true,
        title: t('PinCreate.InvalidPIN'),
        message: t('PinCreate.PleaseUseOnlyNumbersInYourPIN'),
      })
    } else if (!x.length) {
      setModalState({
        visible: true,
        title: t('PinCreate.EnterPINTitle'),
        message: t('PinCreate.YouNeedToCreateA6DigitPIN'),
      })
    } else if (x.length < minPINLength) {
      setModalState({
        visible: true,
        title: t('PinCreate.PINTooShort'),
        message: t('PinCreate.YourPINMustBe6DigitsInLength'),
      })
    } else if (negativePattern.test(y)) {
      setModalState({
        visible: true,
        title: t('PinCreate.InvalidPIN'),
        message: t('PinCreate.PleaseUseOnlyNumbersInYourPIN'),
      })
    } else if (!y.length) {
      setModalState({
        visible: true,
        title: t('PinCreate.ReenterPINTitle'),
        message: t('PinCreate.PleaseReenterYourPIN'),
      })
    } else if (y.length < minPINLength) {
      setModalState({
        visible: true,
        title: t('PinCreate.PINTooShort'),
        message: t('PinCreate.YourPINMustBe6DigitsInLength'),
      })
    } else if (x !== y) {
      setModalState({
        visible: true,
        title: t('PinCreate.PINsDoNotMatch'),
        message: t('PinCreate.EnteredPINsDoNotMatch'),
      })
    } else {
      await passcodeCreate(x)
    }
  }
  const confirmEntry2 = async (x: string, y: string) => {
    if (
      pinSecurity.level >= PinSecurityLevel.Level3 &&
      (consecutiveNumber.test(x) || consecutiveTwoNumber.test(x) || crossNumberPattern.includes(x))
    ) {
      setModalState({
        visible: true,
        title: 'ERROR LEVEL 3',
        message: t('PinCreate.PatternDetectedInYourPIN'),
      })
      return
    }
    if (
      pinSecurity.level >= PinSecurityLevel.Level2 &&
      (consecutiveSeries.test(x) || evenNumberSeries.test(x) || OddNumberSeries.test(x))
    ) {
      setModalState({
        visible: true,
        title: 'ERROR LEVEL 2',
        message: t('PinCreate.SeriesDetectedInYourPIN'),
      })
      return
    }
    if (pinSecurity.level >= PinSecurityLevel.Level1)
      if (!isNumber.test(x)) {
        setModalState({
          visible: true,
          title: t('PinCreate.InvalidPIN'),
          message: t('PinCreate.PleaseUseOnlyNumbersInYourPIN'),
        })
        return
      } else if (x.length < pinSecurity.minLength) {
        setModalState({
          visible: true,
          title: t('PinCreate.PINTooShort'),
          message: t('PinCreate.YourPINMustBe6DigitsInLength'),
        })
        return
      } else if (x.length > pinSecurity.maxLength) {
        setModalState({
          visible: true,
          title: 'ERROR Too Long',
          message: t('PinCreate.YourPINMustBe6DigitsInLength'),
        })
        return
      } else if (x !== y) {
        setModalState({
          visible: true,
          title: t('PinCreate.PINsDoNotMatch'),
          message: t('PinCreate.EnteredPINsDoNotMatch'),
        })
        return
      }
    await passcodeCreate(x)
  }

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
      <View style={[style.container]}>
        <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
          <Text style={{ fontWeight: 'bold' }}>{t('PinCreate.RememberPIN')}</Text> {t('PinCreate.PINDisclaimer')}
        </Text>
        <PinInput
          label={t('PinCreate.EnterPINTitle')}
          onPinChanged={setPin}
          testID={testIdWithKey('EnterPIN')}
          accessibilityLabel={t('PinCreate.EnterPIN')}
          autoFocus={true}
        />
        <PinInput
          label={t('PinCreate.ReenterPIN')}
          onPinChanged={(p: string) => {
            setPinTwo(p)
            if (p.length === minPINLength) {
              Keyboard.dismiss()
            }
          }}
          testID={testIdWithKey('ReenterPIN')}
          accessibilityLabel={t('PinCreate.ReenterPIN')}
        />
        {modalState.visible && (
          <AlertModal
            title={modalState.title}
            message={modalState.message}
            submit={() => setModalState({ ...modalState, visible: false })}
          />
        )}
      </View>
      <View style={{ marginTop: 'auto', margin: 20 }}>
        <Button
          title={t('PinCreate.CreatePIN')}
          testID={testIdWithKey('CreatePIN')}
          accessibilityLabel={t('PinCreate.CreatePIN')}
          buttonType={ButtonType.Primary}
          disabled={!continueEnabled}
          onPress={async () => {
            Keyboard.dismiss()
            await confirmEntry2(pin, pinTwo)
          }}
        />
      </View>
    </SafeAreaView>
  )
}

export default PinCreate
