import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, StyleSheet } from 'react-native'
import * as Keychain from 'react-native-keychain'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import TextInput from '../components/inputs/TextInput'
import { useAuth } from '../providers/AuthProvider'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { testIdWithKey } from '../utils/testable'
import { useThemeContext } from '../utils/themeContext'

interface PinCreateProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const PinCreate: React.FC<PinCreateProps> = ({ setAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')
  const [, dispatch] = useContext(Context)
  const { setAppPin } = useAuth()
  const { t } = useTranslation()
  const { ColorPallet } = useThemeContext()
  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      margin: 20,
    },
  })
  const passcodeCreate = async (pin: string) => {
    const passcode = JSON.stringify(pin)
    const description = t('PinCreate.UserAuthenticationPin')
    try {
      // await Keychain.setGenericPassword(description, passcode, {
      //   service: 'passcode',
      // })
      console.log('here3')
      await setAppPin(pin)
      console.log('here4')
      //This will trigger initAgent
      setAuthenticated(true)

      //This will trigger navigation to internal pages
      dispatch({
        type: DispatchAction.SetDidCreatePIN,
        payload: [{ DidCreatePIN: true }],
      })
    } catch (e) {
      // TODO:(jl)
      Alert.alert(`${e}`)
    }
  }

  const confirmEntry = (x: string, y: string) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert(t('PinCreate.PinMustBe6DigitsInLength'))
    } else if (x !== y) {
      Alert.alert(t('PinCreate.PinsEnteredDoNotMatch'))
    } else {
      passcodeCreate(x)
    }
  }

  return (
    <SafeAreaView style={[style.container]}>
      <TextInput
        accessibilityLabel={t('Global.EnterPin')}
        testID={testIdWithKey('EnterPin')}
        label={t('Global.EnterPin')}
        placeholder={t('Global.6DigitPin')}
        placeholderTextColor={ColorPallet.grayscale.lightGrey}
        maxLength={6}
        autoFocus
        keyboardType="numeric"
        secureTextEntry={true}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        accessibilityLabel={t('PinCreate.ReenterPin')}
        testID={testIdWithKey('ReenterPin')}
        label={t('PinCreate.ReenterPin')}
        placeholder={t('Global.6DigitPin')}
        placeholderTextColor={ColorPallet.grayscale.lightGrey}
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
        testID={testIdWithKey('Create')}
        buttonType={ButtonType.Primary}
        onPress={() => {
          Keyboard.dismiss()
          confirmEntry(pin, pinTwo)
        }}
      />
    </SafeAreaView>
  )
}

export default PinCreate
