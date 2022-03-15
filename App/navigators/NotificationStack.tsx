import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestAttributeDetails from '../screens/ProofRequestAttributeDetails'
import { NotificationStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const NotificationStack: React.FC = () => {
  const Stack = createStackNavigator<NotificationStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.CredentialOffer} component={CredentialOffer} />
      <Stack.Screen name={Screens.ProofRequest} component={ProofRequest} />
      <Stack.Screen name={Screens.ProofRequestAttributeDetails} component={ProofRequestAttributeDetails} />
    </Stack.Navigator>
  )
}

export default NotificationStack
