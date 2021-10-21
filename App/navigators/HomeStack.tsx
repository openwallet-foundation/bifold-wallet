import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Home from '../screens/Home'
import CredentialOffer from '../screens/CredentialOffer'
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
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Credential Offer" component={CredentialOffer} />
      <Stack.Screen name="Proof Request" component={ProofRequest} />
    </Stack.Navigator>
  )
}

export default HomeStack
