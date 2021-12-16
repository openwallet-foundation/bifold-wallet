import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialOffer from '../screens/CredentialOffer'
import Home from '../screens/Home'
import ProofRequest from '../screens/ProofRequest'

import defaultStackOptions from './defaultStackOptions'

export type HomeStackParams = {
  Home: undefined
  'Credential Offer': { credentialId: string }
  'Proof Request': { proofId: string }
}

const Stack = createStackNavigator<HomeStackParams>()

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Credential Offer" component={CredentialOffer} />
      <Stack.Screen name="Proof Request" component={ProofRequest} />
    </Stack.Navigator>
  )
}

export default HomeStack
