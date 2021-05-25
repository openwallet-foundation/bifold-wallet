import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import defaultStackOptions from './defaultStackOptions'
import Workflow from '../screens/Workflow'

const Stack = createStackNavigator()

function ScanStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Scan" component={Workflow} />
    </Stack.Navigator>
  )
}

export default ScanStack
