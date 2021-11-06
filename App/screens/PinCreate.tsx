import React, { useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { Button, TextInput, SafeAreaScrollView } from 'components'
import { useTranslation } from 'react-i18next'

interface IPinCreate {
  setupScreens: number
  navigation: any
  route: any
}

let textInput: any
let secondTextInput: any

function PinCreate(props: IPinCreate) {
  const { t } = useTranslation()

  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')

  const passcodeCreate = async (x: any) => {
    const passcode = JSON.stringify(x)
    const description = 'user authentication pin'
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x: any, y: any) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert(t('PinCreate.pinMustBe6DigitsInLength'))
    } else if (x !== y) {
      textInput.clear()
      secondTextInput.clear()
      Alert.alert(t('PinCreate.pinsEnteredDoNotMatch'))
    } else {
      passcodeCreate(x)
      props.route.params.setAuthenticated(true)
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label={t('PinCreate.enterPin')}
        placeholder={t('PinCreate.6DigitPin')}
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        label={t('PinCreate.reEnterPin')}
        placeholder={t('PinCreate.6DigitPin')}
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
        title={t('PinCreate.create')}
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaScrollView>
  )
}

export default PinCreate
