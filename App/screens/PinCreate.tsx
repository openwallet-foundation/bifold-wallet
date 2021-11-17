import styled from '@emotion/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const passcodeCreate = async (x: string) => {
    const passcode = JSON.stringify(x)
    const description = t('PinCreate.user_authentication_pin')
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x: string, y: string) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert(t('PinCreate.pin_must_be_6_digits_in_length'))
    } else if (x !== y) {
      Alert.alert(t('PinCreate.pins_entered_do_not_match'))
    } else {
      passcodeCreate(x)
      route?.params?.setAuthenticated(true)
    }
  }

  return (
    <SafeAreaScrollView>
      <Row>
        <TextInput
          label={t('Global.enter_pin')}
          placeholder={t('Global.6_digit_pin')}
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
          label={t('PinCreate.re-enter_Pin')}
          placeholder={t('Global.6_digit_pin')}
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
          title={t('PinCreate.create')}
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
