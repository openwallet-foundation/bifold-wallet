import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const CredentialStack: React.FC = () => {
  const { t } = useTranslation()
  const Stack = createStackNavigator<CredentialStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerBackTitle: t('Global.Back') }}>
      <Stack.Screen name={Screens.Credentials} component={ListCredentials} />
      <Stack.Screen name={Screens.CredentialDetails} component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
