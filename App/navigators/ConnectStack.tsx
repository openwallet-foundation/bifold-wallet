import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Scan from '../screens/Scan'
import { ConnectStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Scan} component={Scan} />
    </Stack.Navigator>
  )
}

export default ConnectStack
