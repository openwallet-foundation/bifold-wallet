import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useTheme } from '../contexts/theme'
import AttemptLockout from '../screens/AttemptLockout'
import PINEnter from '../screens/PINEnter'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

interface AuthenticateStackProps {
  setAuthenticated: (status: boolean) => void
}

const AuthenticateStack: React.FC<AuthenticateStackProps> = ({ setAuthenticated }) => {
  const Stack = createStackNavigator<AuthenticateStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, presentation: 'transparentModal', headerShown: false }}>
      <Stack.Screen name={Screens.EnterPIN} component={PINEnter} initialParams={{ setAuthenticated }} />
      <Stack.Screen name={Screens.AttemptLockout} component={AttemptLockout} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
