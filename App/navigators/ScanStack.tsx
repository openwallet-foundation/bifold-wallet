import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Scan from '../screens/Scan'

import defaultStackOptions from './defaultStackOptions'

import { ScanStackParams } from 'types/navigators'

const ScanStack: React.FC = () => {
  const Stack = createStackNavigator<ScanStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Scan" component={Scan} />
    </Stack.Navigator>
  )
}

export default ScanStack
