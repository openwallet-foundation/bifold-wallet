import React, { useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { TextInput, SafeAreaScrollView, PAButton } from 'components'

function PinEnter({ route }) {
  const [pin, setPin] = useState('')

  const checkPin = async (pin) => {
    const checker = await Keychain.getGenericPassword({ service: 'passcode' })
    if (pin.length > 6) {
      Alert.alert('Pin must be 6 digits in length')
    } else if (JSON.stringify(pin) === checker.password) {
      route.params.setAuthenticated(true)
    } else {
      textInput.clear()
      Alert.alert('Incorrect Pin')
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label="Enter Pin"
        maxLength={6}
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={(pin) => {
          setPin(pin.replace(/[^0-9]/g, ''))
          if (pin.length == 6) {
            Keyboard.dismiss()
          }
        }}
      />
      <PAButton
        title="Submit"
        onPress={() => {
          Keyboard.dismiss()
          checkPin(pin)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinEnter
