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
      Alert.alert(t('Incorrect Pin'))
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label={t('Enter Pin')}
        accessible={true}
        accessibilityLabel={t('Enter Pin')}
        placeholder={t('6 Digit Pin')}
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
        title={t('Submit')}
        accessibilityLabel={t('Submit')}
        onPress={() => {
          Keyboard.dismiss()
          checkPin(pin)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinEnter
