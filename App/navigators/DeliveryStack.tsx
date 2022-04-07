import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Connection from '../screens/Connection'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { useThemeContext } from '../utils/themeContext'

import { createDefaultStackOptions } from './defaultStackOptions'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const theme = useThemeContext()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{ ...defaultStackOptions, headerShown: false, presentation: 'modal' }}
    >
      <Stack.Screen name={Screens.Connection} component={Connection} options={{ ...defaultStackOptions }} />
      <Stack.Screen name={Screens.ProofRequest} component={ProofRequest} />
      <Stack.Screen name={Screens.CredentialOffer} component={CredentialOffer} />
    </Stack.Navigator>
  )
}

export default DeliveryStack
