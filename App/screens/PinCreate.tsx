import React, { useEffect, useState } from 'react'
import { Alert, Keyboard } from 'react-native'
import * as Keychain from 'react-native-keychain'

import { Button, TextInput, SafeAreaScrollView } from 'components'
import { connect } from 'react-redux'
import { authenticateUserAction } from '../appRedux/actions'

interface IPinCreate {
  setupScreens: number
  navigation: any
  route: any
}

function PinCreate(props: IPinCreate) {
  const { loggedIn, forPin, errorMessage, operationStamp, authenticateUserAction, route } = props

  const [pin, setPin] = useState('')
  const [pinTwo, setPinTwo] = useState('')

  useEffect(() => {
    if (loggedIn) {
      route.params.setAuthenticated(true)
    } else if (errorMessage) {
      Alert.alert(errorMessage)
    }
  }, [loggedIn, errorMessage, operationStamp])

  const passcodeCreate = async (x: any) => {
    const passcode = JSON.stringify(x)
    const description = 'user authentication pin'
    await Keychain.setGenericPassword(description, passcode, {
      service: 'passcode',
    })
  }

  const confirmEntry = (x: any, y: any) => {
    if (x.length < 6 || y.length < 6) {
      Alert.alert('Pin must be 6 digits in length')
    } else if (x !== y) {
      setPin('')
      setPinTwo('')
      Alert.alert('Pins entered do not match')
    } else {
      // passcodeCreate(x)
      // props.route.params.setAuthenticated(true)
      authenticateUserAction(x)
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

const mapStateToProps = (state) => {
  return {
    loggedIn: state.auth.loggedIn,
    forPin: state.auth.pin,
    errorMessage: state.auth.error,
    operationStamp: state.auth.operation,
  }
}

export default connect(mapStateToProps, { authenticateUserAction })(PinCreate)
