import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, StyleSheet } from 'react-native'
import * as Keychain from 'react-native-keychain'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import TextInput from '../components/inputs/TextInput'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { Colors } from '../theme'
import { testIdWithKey } from '../utils/testable'

interface PinCreateProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const style = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    margin: 20,
  },
})

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const [, dispatch] = useContext(Context)
  const { t } = useTranslation()

  const passcodeCreate = async (pin: string) => {
    const passcode = JSON.stringify(pin)
    const description = t('PinCreate.UserAuthenticationPin')
    try {
      await Keychain.setGenericPassword(description, passcode, {
        service: 'passcode',
      })

      dispatch({
        type: DispatchAction.SetDidCreatePIN,
        payload: [{ DidCreatePIN: true }],
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
      <TextInput
        accessibilityLabel={t('Global.EnterPin')}
        testID={testIdWithKey('EnterPin')}
        label={t('Global.EnterPin')}
        placeholder={t('Global.6DigitPin')}
        placeholderTextColor={Colors.lightGrey}
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        accessibilityLabel={t('PinCreate.ReenterPin')}
        testID={testIdWithKey('ReenterPin')}
        label={t('PinCreate.ReenterPin')}
        placeholder={t('Global.6DigitPin')}
        placeholderTextColor={Colors.lightGrey}
        maxLength={6}
        keyboardType="numeric"
        secureTextEntry
        value={pinTwo}
        onChangeText={(text: string) => {
          setPinTwo(text)
          if (text.length === 6) {
            Keyboard.dismiss()
          }
        }}
      />
      <Button
        title={t('PinCreate.Create')}
        accessibilityLabel={t('PinCreate.Create')}
        testID={testIdWithKey('Create')}
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
