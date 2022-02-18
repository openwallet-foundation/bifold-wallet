import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Scan from '../screens/Scan'

import defaultStackOptions from './defaultStackOptions'

import { ScanStackParams, Screens } from 'types/navigators'

const ScanStack: React.FC = () => {
  const Stack = createStackNavigator<ScanStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Scan} component={Scan} />
    </Stack.Navigator>
  )
}

export default ScanStack
