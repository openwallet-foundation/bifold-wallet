import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'
import { RouteProp } from '@react-navigation/core'
import { AuthenticateStackParams } from 'navigators/AuthenticateStack'

import { Button, SafeAreaScrollView, TextInput } from 'components'

interface Props {
  route: RouteProp<AuthenticateStackParams>
}

const PinCreate: React.FC<Props> = ({ route }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const { t } = useTranslation()

  const passcodeCreate = async (x: string) => {
    const passcode = JSON.stringify(x)
    const description = t('user authentication pin')
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x: string, y: string) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert(t('Pin must be 6 digits in length'))
    } else if (x !== y) {
      Alert.alert(t('Pins entered do not match'))
    } else {
      passcodeCreate(x)
      route?.params?.setAuthenticated(true)
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label={t('Enter Pin')}
        placeholder={t('6 Digit Pin')}
        accessible={true}
        accessibilityLabel={t('Enter Pin')}
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        label={t('Re-Enter Pin')}
        accessible={true}
        accessibilityLabel={t('Re-Enter Pin')}
        placeholder={t('6 Digit Pin')}
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
        title={t('Create')}
        accessibilityLabel={t('Create')}
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinCreate
