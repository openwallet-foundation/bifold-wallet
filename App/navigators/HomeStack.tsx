import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialOffer from '../screens/CredentialOffer'
import Home from '../screens/Home'
import ProofRequest from '../screens/ProofRequest'

import defaultStackOptions from './defaultStackOptions'

export type HomeStackParams = {
  Home: undefined
  'Credential Offer': { credentialId: string }
  'Proof Request': undefined
}

const Stack = createStackNavigator<HomeStackParams>()

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Credential Offer" component={CredentialOffer} options={{ headerShown: false }} />
      <Stack.Screen name="Proof Request" component={ProofRequest} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default HomeStack
