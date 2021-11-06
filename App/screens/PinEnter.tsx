import React, { useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { TextInput, SafeAreaScrollView, Button } from 'components'
import { useTranslation } from 'react-i18next'

interface Props {
  route: any
}

const PinEnter: React.FC<Props> = ({ route }) => {
  const { t } = useTranslation()
  
  const [pin, setPin] = useState('')

  const checkPin = async (pin: string) => {
    const keychainEntry = await Keychain.getGenericPassword({ service: 'passcode' })
    if (keychainEntry && JSON.stringify(pin) === keychainEntry.password) {
      route.params.setAuthenticated(true)
    } else {
      Alert.alert(t('PinEnter.incorrectPin'))
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label={t('PinEnter.enterPin')}
        placeholder={t('PinEnter.6DigitPin')}
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
        title={t('PinEnter.submit')}
        onPress={() => {
          Keyboard.dismiss()
          checkPin(pin)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinEnter
