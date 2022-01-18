import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { DispatchAction } from '../Reducer'
import { Context } from '../Store'

import { Button, SafeAreaScrollView, TextInput } from 'components'

interface PinCreateProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

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
    <SafeAreaScrollView>
      <TextInput
        label={t('Global.EnterPin')}
        placeholder={t('Global.6DigitPin')}
        accessible={true}
        accessibilityLabel={t('Global.EnterPin')}
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        label={t('PinCreate.ReenterPin')}
        accessible={true}
        accessibilityLabel={t('PinCreate.ReenterPin')}
        placeholder={t('Global.6DigitPin')}
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
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinCreate
