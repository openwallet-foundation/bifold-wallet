import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Scan from '../screens/Scan'
import { ScanStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const ScanStack: React.FC = () => {
  const Stack = createStackNavigator<ScanStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Scan} component={Scan} />
    </Stack.Navigator>
  )
}

export default ScanStack
