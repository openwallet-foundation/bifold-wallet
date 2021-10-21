import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListCredentials from '../screens/ListCredentials'
import defaultStackOptions from './defaultStackOptions'
import CredentialDetails from '../screens/CredentialDetails'

export type CredentialStackParams = {
  Credentials: undefined
  'Credential Details': { credentialId: string }
}

const Stack = createStackNavigator<CredentialStackParams>()

function CredentialStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Credentials" component={ListCredentials} />
      <Stack.Screen name="Credential Details" component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
