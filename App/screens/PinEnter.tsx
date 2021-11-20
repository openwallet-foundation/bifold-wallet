import type { RouteProp } from '@react-navigation/native'
import type { AuthenticateStackParams } from 'navigators/AuthenticateStack'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { TextInput, SafeAreaScrollView, Button } from 'components'

interface Props {
  route: RouteProp<AuthenticateStackParams, 'Enter Pin'>
}

const PinEnter: React.FC<Props> = ({ route }) => {
  const [pin, setPin] = useState('')
  const { t } = useTranslation()

  const checkPin = async (pin: string) => {
    const keychainEntry = await Keychain.getGenericPassword({ service: 'passcode' })
    if (keychainEntry && JSON.stringify(pin) === keychainEntry.password) {
      route.params.setAuthenticated(true)
    } else {
      Alert.alert(t('PinEnter.IncorrectPin'))
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label={t('Global.EnterPin')}
        accessible={true}
        accessibilityLabel={t('Global.EnterPin')}
        placeholder={t('Global.6DigitPin')}
        autoFocus
        maxLength={6}
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={(pin: string) => {
          setPin(pin.replace(/[^0-9]/g, ''))
          if (pin.length == 6) {
            Keyboard.dismiss()
          }
        }}
      />
      <Button
        title={t('Global.Submit')}
        accessibilityLabel={t('Global.Submit')}
        onPress={() => {
          Keyboard.dismiss()
          checkPin(pin)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinEnter
