import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text } from 'react-native'
import Keychain from 'react-native-keychain'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import AlertModal from '../components/modals/AlertModal'
import { minPINLength } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

interface PinCreateProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

interface ModalState {
  visible: boolean
  title: string
  message: string
}

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    title: '',
    message: '',
  })
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
    const passcode = JSON.stringify(pin)
    const description = t('PinCreate.UserAuthenticationPIN')
    try {
      await Keychain.setGenericPassword(description, passcode, {
        service: 'passcode',
      })

      dispatch({
        type: DispatchAction.DID_CREATE_PIN,
      })
    } catch (e) {
      // TODO:(jl)
    }
  }

  const confirmEntry = (x: string, y: string) => {
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
        title: t('PinCreate.EnterPIN'),
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
        title: t('PinCreate.ReenterPIN'),
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
      passcodeCreate(x)
      setAuthenticated(true)
    }
  }

  return (
    <SafeAreaView style={[style.container]}>
      <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
        <Text style={{ fontWeight: 'bold' }}>{t('PinCreate.RememberPIN')}</Text> {t('PinCreate.PINDisclaimer')}
      </Text>
      <PinInput
        label={t('PinCreate.EnterPIN')}
        onPinChanged={setPin}
        testID="EnterPIN"
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
        testID="ReenterPIN"
        accessibilityLabel={t('PinCreate.ReenterPIN')}
      />

      <Button
        title={t('PinCreate.CreatePIN')}
        testID={testIdWithKey('CreatePIN')}
        accessibilityLabel={t('PinCreate.CreatePIN')}
        buttonType={ButtonType.Primary}
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
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
