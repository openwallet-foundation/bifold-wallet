import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import PinEnter from '../screens/PinEnter'

import defaultStackOptions from './defaultStackOptions'

export type AuthenticateStackParams = {
  'Enter Pin': { setAuthenticated: (auth: boolean) => void }
}

const Stack = createStackNavigator<AuthenticateStackParams>()

interface Props {
  setAuthenticated: (auth: boolean) => void
}

const AuthenticateStack: React.FC<Props> = ({ setAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, presentation: 'transparentModal', headerShown: false }}>
      <Stack.Screen name="Enter Pin" component={PinEnter} initialParams={{ setAuthenticated }} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
