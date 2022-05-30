import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, StyleSheet, View } from 'react-native'
import * as Keychain from 'react-native-keychain'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Text } from '../../lib/commonjs/components'
import Button, { ButtonType } from '../components/buttons/Button'
import PinInput from '../components/inputs/PinInput'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

import { TextTheme } from 'theme'

interface PinCreateProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
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
    const description = t('PinCreate.UserAuthenticationPin')
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
    if (x.length < 6 || y.length < 6) {
      Alert.alert(t('PinCreate.PinMustBe6DigitsInLength'))
    } else if (x !== y) {
      Alert.alert(t('PinCreate.PinsEnteredDoNotMatch'))
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
      <PinInput label={t('PinCreate.EnterPIN')} onPinChanged={setPin} />
      <PinInput
        label={t('PinCreate.ReenterPIN')}
        onPinChanged={(p: string) => {
          setPinTwo(p)
          if (p.length === 6) {
            Keyboard.dismiss()
          }
        }}
      />

      <Button
        title={t('PinCreate.CreatePIN')}
        accessibilityLabel={t('PinCreate.CreatePIN')}
        testID={testIdWithKey('CreatePIN')}
        buttonType={ButtonType.Primary}
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaView>
  )
}

export default PinCreate
