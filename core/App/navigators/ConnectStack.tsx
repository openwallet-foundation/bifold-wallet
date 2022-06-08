import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { uiConfig } from '../../configs/uiConfig'
import { useTheme } from '../contexts/theme'
import Connect from '../screens/Connect'
import DisplayCode from '../screens/DisplayCode'
import Scan from '../screens/Scan'
import { ConnectStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      {uiConfig.allowQrDisplay && <Stack.Screen name={Screens.Connect} component={Connect} />}
      <Stack.Screen name={Screens.Scan} component={Scan} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen
        name={Screens.DisplayCode}
        component={DisplayCode}
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export default ConnectStack
