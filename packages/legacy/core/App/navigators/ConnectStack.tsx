import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ConnectStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { scan } = useConfiguration()
  const [store] = useStore()
  return (
    <Stack.Navigator
      // below is part of the temporary gating of the new scan screen tabs feature
      screenOptions={{ ...defaultStackOptions, headerShown: store.preferences.useConnectionInviterCapability }}
    >
      <Stack.Screen name={Screens.Scan} component={scan} />
    </Stack.Navigator>
  )
}

export default ConnectStack
