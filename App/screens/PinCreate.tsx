import styled from '@emotion/native'
import React, { useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { Button, SafeAreaScrollView, TextInput } from 'components'

interface Props extends TextInputProps {
  label: string
}

const Row = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-self: stretch;
  margin: 5px 25px 10px 25px;
`

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
      <Row>
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
      </Row>
      <Row>
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
      </Row>
      <Row>
        <Button
          title="Create"
          onPress={() => {
            Keyboard.dismiss()
            confirmEntry(pin, pinTwo)
          }}
        />
      </Row>
    </SafeAreaScrollView>
  )
}

export default PinCreate
