import React, { useState } from 'react'

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { useHistory } from 'react-router-native'

import * as Keychain from 'react-native-keychain'

import AppHeaderLarge from '../AppHeaderLarge/index'
import LoadingOverlay from '../LoadingOverlay/index'

import AppStyles from '../../assets/styles'

interface IPinCreate {
  setupScreens: number
  setSetupScreens: (setupScreens: number) => void
}

function PinCreate(props: IPinCreate) {
  const history = useHistory()

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')

  const [focusedLabel, setFocusedLabel] = useState('')
  const [focusedLabelTwo, setFocusedLabelTwo] = useState('')

  let textInput
  let secondTextInput

  const passcodeCreate = async (x) => {
    const passcode = JSON.stringify(x)
    const description = 'user authentication pin'
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x, y) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert('Pin must be 6 digits in length')
    } else if (x !== y) {
      textInput.clear()
      secondTextInput.clear()
      Alert.alert('Pins entered do not match')
    } else {
      passcodeCreate(x)
      setLoadingOverlayVisible(true)
      setTimeout(() => {
        console.log('Pin Create Change')
        props.setSetupScreens(props.setupScreens + 1)
      }, 2000)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView behavior={'height'} keyboardVerticalOffset={20} style={AppStyles.viewFull}>
        <AppHeaderLarge disabled={true} />
        <View style={AppStyles.tab}>
          <Text style={[AppStyles.h1, AppStyles.textSecondary, { marginBottom: 20 }]}>Create a 6-Digit Pin</Text>
          <View>
            <Text style={[AppStyles.h3, AppStyles.textSecondary]}>Enter Pin:</Text>
            <TextInput
              autoCorrect={false}
              style={[AppStyles.formLabel, focusedLabel]}
              maxLength={6}
              keyboardType="numeric"
              secureTextEntry={true}
              value={pin}
              ref={(input) => {
                textInput = input
              }}
              onSubmitEditing={() => {
                secondTextInput.focus()
              }}
              blurOnSubmit={false}
              onFocus={() => setFocusedLabel(AppStyles.formLabelFocused)}
              onBlur={() => setFocusedLabel('')}
              onChangeText={(pin) => {
                setPin(pin.replace(/[^0-9]/g, ''))
                if (pin.length == 6) {
                  secondTextInput.focus()
                }
              }}
            />
          </View>
          <View>
            <Text style={[AppStyles.h3, AppStyles.textSecondary]}>Re-Enter Pin:</Text>
            <TextInput
              autoCorrect={false}
              style={[AppStyles.formLabel, focusedLabelTwo]}
              maxLength={6}
              keyboardType="numeric"
              secureTextEntry={true}
              value={pinTwo}
              ref={(input) => {
                secondTextInput = input
              }}
              onSubmitEditing={() => {
                confirmEntry(pin, pinTwo)
              }}
              onFocus={() => setFocusedLabelTwo(AppStyles.formLabelFocused)}
              onBlur={() => setFocusedLabelTwo('')}
              onChangeText={(pinTwo) => {
                setPinTwo(pinTwo.replace(/[^0-9]/g, ''))
                if (pinTwo.length == 6) {
                  Keyboard.dismiss()
                }
              }}
            />
          </View>
          <TouchableOpacity
            style={[AppStyles.button, AppStyles.backgroundPrimary, { marginTop: 30 }]}
            onPress={() => {
              Keyboard.dismiss()
              confirmEntry(pin, pinTwo)
            }}
          >
            <Text style={[AppStyles.h2, AppStyles.textWhite]}>Create</Text>
          </TouchableOpacity>
        </View>
        {loadingOverlayVisible ? <LoadingOverlay /> : null}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default PinCreate
