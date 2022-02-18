import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'

import defaultStackOptions from './defaultStackOptions'

import { CredentialStackParams, Screens } from 'types/navigators'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Credentials} component={ListCredentials} />
      <Stack.Screen name={Screens.CredentialDetails} component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
