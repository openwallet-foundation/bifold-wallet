import React, { useState, useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import * as Keychain from 'react-native-keychain'
import AsyncStorage from '@react-native-community/async-storage'

import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Terms from '../screens/Terms'

import defaultStackOptions from './defaultStackOptions'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

interface Props {
  setAuthenticated: any
}

const AuthenticateStack: React.FC<Props> = ({ setAuthenticated }) => {
  const { t } = useTranslation()

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
          <Stack.Screen
            options={{ title: t('AuthenticateStack.termsConditions') }}
            name="Terms & Conditions"
            component={Terms}
          />
          <Stack.Screen
            options={{ title: t('AuthenticateStack.create6DigitPin') }}
            name="Create 6-Digit Pin"
            component={PinCreate}
            initialParams={{ setAuthenticated }}
          />
        </>
      )}
      <Stack.Screen
        options={{ title: t('AuthenticateStack.enterPin') }}
        name="Enter Pin"
        component={PinEnter}
        initialParams={{ setAuthenticated }}
      />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
