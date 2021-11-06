import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListCredentials from '../screens/ListCredentials'
import defaultStackOptions from './defaultStackOptions'
import CredentialDetails from '../screens/CredentialDetails'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

function CredentialStack() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen options={{title: t('CredentialStack.credentials')}} name="Credentials" component={ListCredentials} />
      <Stack.Screen options={{title: t('CredentialStack.credentialDetails')}} name="CredentialDetails" component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
