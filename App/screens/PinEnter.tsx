import React, { useEffect, useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { TextInput, SafeAreaScrollView, Button } from 'components'
import { connect } from 'react-redux'
import { signInUserAction } from '../appRedux/actions'

interface Props {
  route: any
}

const PinEnter: React.FC<Props> = (props) => {
  const [pin, setPin] = useState('')
  const { loggedIn, forPin, errorMessage, operationStamp, signInUserAction, route } = props

  useEffect(() => {
    if (loggedIn) {
      route.params.setAuthenticated(true)
    } else if (errorMessage) {
      Alert.alert(errorMessage)
    }
  }, [loggedIn, errorMessage, operationStamp])

  const checkPin = async (pin: string) => {
    const keychainEntry = await Keychain.getGenericPassword({ service: 'passcode' })
    if (keychainEntry && JSON.stringify(pin) === keychainEntry.password) {
      // route.params.setAuthenticated(true)
    } else {
      Alert.alert('Incorrect Pin')
    }
  }

  return (
    <SafeAreaScrollView>
      <TextInput
        label="Enter Pin"
        placeholder="6 Digit Pin"
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
        title="Submit"
        onPress={() => {
          Keyboard.dismiss()
          // checkPin(pin)
          signInUserAction(pin)
        }}
      />
    </SafeAreaScrollView>
  )
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.auth.loggedIn,
    forPin: state.auth.pin,
    errorMessage: state.auth.error,
    operationStamp: state.auth.operation,
  }
}
export default connect(mapStateToProps, { signInUserAction })(PinEnter)
