import React, { useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'
import { RouteProp } from '@react-navigation/native'

import type { AuthenticateStackParams } from 'navigators/AuthenticateStack'

import { Button, TextInput, SafeAreaScrollView } from 'components'

interface Props {
  route: RouteProp<AuthenticateStackParams, 'Create 6-Digit Pin'>
}

const PinCreate: React.FC<Props> = ({ route }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')

  const passcodeCreate = async (x: string) => {
    const passcode = JSON.stringify(x)
    const description = 'user authentication pin'
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x: string, y: string) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert('Pin must be 6 digits in length')
    } else if (x !== y) {
      Alert.alert('Pins entered do not match')
    } else {
      passcodeCreate(x)
      route?.params?.setAuthenticated(true)
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label="Enter Pin"
        placeholder="6 Digit Pin"
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        label="Re-Enter Pin"
        placeholder="6 Digit Pin"
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
        title="Create"
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinCreate
