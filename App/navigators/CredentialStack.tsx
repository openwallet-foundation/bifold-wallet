import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListCredentials from '../screens/ListCredentials'
import defaultStackOptions from './defaultStackOptions'

const Stack = createStackNavigator()

function CredentialStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Credentials" component={ListCredentials} />
    </Stack.Navigator>
  )
}

export default CredentialStack
