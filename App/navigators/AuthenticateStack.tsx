import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import PinEnter from '../screens/PinEnter'

import defaultStackOptions from './defaultStackOptions'

import { AuthenticateStackParams, Screens } from 'types/navigators'

interface AuthenticateStackProps {
  setAuthenticated: (auth: boolean) => void
}

const AuthenticateStack: React.FC<AuthenticateStackProps> = ({ setAuthenticated }) => {
  const Stack = createStackNavigator<AuthenticateStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, presentation: 'transparentModal', headerShown: false }}>
      <Stack.Screen name={Screens.EnterPin} component={PinEnter} initialParams={{ setAuthenticated }} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
