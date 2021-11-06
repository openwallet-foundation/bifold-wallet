import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Home from '../screens/Home'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'

import defaultStackOptions from './defaultStackOptions'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

function HomeStack() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen options={{ title: t('HomeStack.home') }} name="Home" component={Home} />
      <Stack.Screen
        options={{ title: t('HomeStack.credentialOffer') }}
        name="Credential Offer"
        component={CredentialOffer}
      />
      <Stack.Screen options={{ title: t('HomeStack.proofRequest') }} name="Proof Request" component={ProofRequest} />
    </Stack.Navigator>
  )
}

export default HomeStack
