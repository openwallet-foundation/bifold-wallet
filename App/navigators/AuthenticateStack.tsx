import AsyncStorage from '@react-native-community/async-storage'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
// eslint-disable-next-line import/namespace
import * as Keychain from 'react-native-keychain'

import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Terms from '../screens/Terms'

import defaultStackOptions from './defaultStackOptions'

export type AuthenticateStackParams = {
  'Terms & Conditions': undefined
  'Create 6-Digit Pin': { setAuthenticated: (auth: boolean) => void } | undefined
  'Enter Pin': { setAuthenticated: (auth: boolean) => void }
}

const Stack = createStackNavigator<AuthenticateStackParams>()

interface Props {
  setAuthenticated: (auth: boolean) => void
}

const AuthenticateStack: React.FC<Props> = ({ setAuthenticated }) => {
  const [firstLogin, setFirstLogin] = useState(true)

  const checkFirstLogin = async () => {
    try {
      const firstLaunch = await AsyncStorage.getItem('firstLaunch')
      const pin = await Keychain.getGenericPassword({ service: 'passcode' })
      if (firstLaunch == null) {
        await AsyncStorage.setItem('firstLaunch', 'false')
        await Keychain.resetGenericPassword({ service: 'passcode' })
      } else {
        if (pin) {
          setFirstLogin(false)
        }
      }
    } catch (e) {
      //TODO: error
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
          <Stack.Screen name="Create 6-Digit Pin" component={PinCreate} initialParams={{ setAuthenticated }} />
        </>
      )}
      <Stack.Screen name="Enter Pin" component={PinEnter} initialParams={{ setAuthenticated }} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
