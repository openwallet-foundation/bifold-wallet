import React, { useState, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import * as Keychain from 'react-native-keychain'

import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Terms from '../screens/Terms'

import defaultStackOptions from './defaultStackOptions'

const Stack = createStackNavigator()

interface Props {
  setAuthenticated: () => void
}

const AuthenticateStack: React.FC<Props> = ({ setAuthenticated }) => {
  const [firstLogin, setFirstLogin] = useState(true)

  const checkFirstLogin = async () => {
    await Keychain.resetGenericPassword({ service: 'passcode' })
    const creds = await Keychain.getGenericPassword({ service: 'passcode' })
    if (creds) {
      setFirstLogin(false)
    }
  }

  useEffect(() => {
    checkFirstLogin()
  }, [])

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      {firstLogin && (
        <>
          <Stack.Screen name="Terms & Conditions" component={Terms} />
          <Stack.Screen name="Create 6-Digit Pin" component={PinCreate} />
        </>
      )}
      <Stack.Screen name="Enter Pin" component={PinEnter} initialParams={{ setAuthenticated }} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
