import React, {useState, useEffect} from 'react'

import {
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import * as Keychain from 'react-native-keychain'

import AppHeaderLarge from '../AppHeaderLarge/index.js'
import LoadingOverlay from '../LoadingOverlay/index.js'

import AppStyles from '../../assets/styles'

function PinEnter(props) {
  let history = useHistory()

  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(false)

  const [pin, setPin] = useState('')

  const [focusedLabel, setFocusedLabel] = useState('')

  let textInput

  const checkPin = async (pin) => {
    const checker = await Keychain.getGenericPassword({service: 'passcode'})
    if (pin.length > 6) {
      Alert.alert('Pin must be 6 digits in length')
    } else if (JSON.stringify(pin) === checker.password) {
      setLoadingOverlayVisible(true)

      setTimeout(() => {
        if (props.setupScreens) {
          console.log('Pin Enter Change')
          //logic to clear pin enter (only required with consecutive identical components)
          if (textInput) {
            textInput.clear()
          }
          setLoadingOverlayVisible(false)

          props.setSetupScreens(props.setupScreens + 1)
        } else {
          props.setAuthenticated(true)
          history.push('/home')
        }
      }, 2200)
    } else {
      textInput.clear()
      Alert.alert('Incorrect Pin')
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{height: '100%'}}>
        <AppHeaderLarge disabled={true} />
        <View style={AppStyles.tab}>
          <Text
            style={[AppStyles.h1, AppStyles.textBlueDark, {marginBottom: 30}]}>
            Enter Your Pin
          </Text>
          <View>
            <Text style={[AppStyles.h3, AppStyles.textBlueDark]}>
              Enter Pin:
            </Text>
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
                checkPin(pin)
              }}
              onFocus={() => setFocusedLabel(AppStyles.formLabelFocused)}
              onBlur={() => setFocusedLabel('')}
              onChangeText={(pin) => {
                setPin(pin.replace(/[^0-9]/g, ''))
                if (pin.length == 6) {
                  Keyboard.dismiss()
                }
              }}
            />
          </View>
          <TouchableOpacity
            style={[AppStyles.button, AppStyles.buttonGreen, {marginTop: 30}]}
            onPress={() => {
              Keyboard.dismiss()
              checkPin(pin)
            }}>
            <Text style={[AppStyles.h2, AppStyles.textWhite]}>Submit</Text>
          </TouchableOpacity>
        </View>
        {loadingOverlayVisible ? <LoadingOverlay /> : null}
      </View>
    </TouchableWithoutFeedback>
  )
}

export default PinEnter
