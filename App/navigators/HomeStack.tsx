import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialOffer from '../screens/CredentialOffer'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
import ProofRequest from '../screens/ProofRequest'

import defaultStackOptions from './defaultStackOptions'

import { HomeStackParams } from 'types/navigators'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Notifications" component={ListNotifications} />
      <Stack.Screen name="Credential Offer" component={CredentialOffer} />
      <Stack.Screen name="Proof Request" component={ProofRequest} />
    </Stack.Navigator>
  )
}

export default HomeStack
