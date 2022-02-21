import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import CredentialOffer from '../screens/CredentialOffer'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestAttributeDetails from '../screens/ProofRequestAttributeDetails'
import { HomeStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const HomeStack: React.FC = () => {
  const { t } = useTranslation()
  const Stack = createStackNavigator<HomeStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerBackTitle: t('Global.Back') }}>
      <Stack.Screen name={Screens.Home} component={Home} />
      <Stack.Screen name={Screens.Notifications} component={ListNotifications} />
      <Stack.Screen name={Screens.CredentialOffer} component={CredentialOffer} />
      <Stack.Screen name={Screens.ProofRequest} component={ProofRequest} />
      <Stack.Screen name={Screens.ProofRequestAttributeDetails} component={ProofRequestAttributeDetails} />
    </Stack.Navigator>
  )
}

export default HomeStack
