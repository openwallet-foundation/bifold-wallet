import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Keyboard, StyleSheet, Text, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { minPINLength } from '../constants'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

interface PinCreateProps {
  setAuthenticated: GenericFn
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

  const { ColorPallet, TextTheme } = useTheme()
  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      margin: 20,
    },
  })

  const passcodeCreate = async (pin: string) => {
    try {
      setContinueEnabled(false)
      await setPIN(pin)
      // This will trigger initAgent
      setAuthenticated()

      dispatch({
        type: DispatchAction.DID_CREATE_PIN,
      })

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

  return (
    <SafeAreaView style={[style.container]}>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(style.container.backgroundColor)
        }
      />
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

      <Button
        title={t('PinCreate.CreatePIN')}
        testID={testIdWithKey('CreatePIN')}
        accessibilityLabel={t('PinCreate.CreatePIN')}
        buttonType={ButtonType.Primary}
        disabled={!continueEnabled}
        onPress={async () => {
          Keyboard.dismiss()
          await confirmEntry(pin, pinTwo)
        }}
      />
      {modalState.visible && (
        <AlertModal
          title={modalState.title}
          message={modalState.message}
          submit={() => setModalState({ ...modalState, visible: false })}
        />
      )}
    </SafeAreaView>
  )
}

export default PinCreate
