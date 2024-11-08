import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import Connection from '../screens/Connection'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import { DeliveryStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import OpenIDCredentialDetails from '../modules/openid/screens/OpenIDCredentialOffer'
import { TOKENS, useServices } from '../container-api'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const { t } = useTranslation()
  const theme = useTheme()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [
    DeliveryHeaderRight,
    DeliveryProofHeaderRight,
    DeliveryCredOfferHeaderRight,
    DeliveryOpenIdHeaderRight
  ] = useServices([
    TOKENS.COMPONENT_DELIVERY_HEADER_RIGHT,
    TOKENS.COMPONENT_DELIVERY_PROOF_HEADER_RIGHT,
    TOKENS.COMPONENT_DELIVERY_CRED_OFFER_HEADER_RIGHT,
    TOKENS.COMPONENT_DELIVERY_OPEN_ID_HEADER_RIGHT
  ])
  

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{
        ...defaultStackOptions,
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        headerShown: true,
        presentation: 'modal',
        headerLeft: () => null,
        headerRight: () => <DeliveryHeaderRight />,
      }}
    >
      <Stack.Screen
        name={Screens.Connection}
        component={Connection}
        options={{ ...defaultStackOptions }}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{ 
          title: t('Screens.ProofRequest'),
          headerRight: () => <DeliveryProofHeaderRight />,
        }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{
          title: t('Screens.CredentialOffer'),
          headerRight: () => <DeliveryCredOfferHeaderRight />,
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialDetails}
        component={OpenIDCredentialDetails}
        options={{
          title: t('Screens.CredentialOffer'),
          headerRight: () => <DeliveryOpenIdHeaderRight />,
        }}
      />
    </Stack.Navigator>
  )
}

export default DeliveryStack
