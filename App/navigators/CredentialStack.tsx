import { CredentialRecord } from '@aries-framework/core'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'

import defaultStackOptions from './defaultStackOptions'

export type CredentialStackParams = {
  Credentials: undefined
  'Credential Details': CredentialRecord
}

const Stack = createStackNavigator<CredentialStackParams>()

function CredentialStack() {
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Credentials" component={ListCredentials} />
      <Stack.Screen name="Credential Details" component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
