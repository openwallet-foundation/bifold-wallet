import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Connection from '../screens/Connection'
import CredentialOffer from '../screens/CredentialOffer'
import { DeliveryStackParams, Screens } from '../types/navigators'

import defaultStackOptions from './defaultStackOptions'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{ ...defaultStackOptions, headerShown: false, presentation: 'modal' }}
    >
      <Stack.Screen name={Screens.Connection} component={Connection} options={{ ...defaultStackOptions }} />
      <Stack.Screen name={Screens.CredentialOffer} component={CredentialOffer} />
    </Stack.Navigator>
  )
}

export default DeliveryStack
