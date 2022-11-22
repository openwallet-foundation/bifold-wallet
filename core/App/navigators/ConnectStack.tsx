import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { ConnectStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { scan } = useConfiguration()
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Scan} component={scan} />
    </Stack.Navigator>
  )
}

export default ConnectStack
