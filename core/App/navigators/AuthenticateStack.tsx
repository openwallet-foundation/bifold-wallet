import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useTheme } from '../contexts/theme'
import PinEnter from '../screens/PinEnter'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const AuthenticateStack: React.FC = () => {
  const Stack = createStackNavigator<AuthenticateStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, presentation: 'transparentModal', headerShown: false }}>
      <Stack.Screen name={Screens.EnterPin} component={PinEnter} />
    </Stack.Navigator>
  )
}

export default AuthenticateStack
