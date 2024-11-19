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
import HeaderRightHome from '../components/buttons/HeaderHome'
import OpenIDProofPresentation from '../modules/openid/screens/OpenIDProofPresentation'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const { t } = useTranslation()
  const theme = useTheme()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [screenOptions] = useServices([TOKENS.SCREEN_OPTIONS])

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{
        ...defaultStackOptions,
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        headerShown: true,
        presentation: 'modal',
        headerLeft: () => null,
        headerRight: () => <HeaderRightHome />
      }}
    >
      <Stack.Screen
        name={Screens.Connection}
        component={Connection}
        options={{ ...defaultStackOptions, ...screenOptions.connectionScreenOptions}}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{
          title: t('Screens.ProofRequest'),
        ...screenOptions.proofRequestScreenOptions
        }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{
          title: t('Screens.CredentialOffer'),
          ...screenOptions.credentialOfferScreenOptions
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialDetails}
        component={OpenIDCredentialDetails}
        options={{
          title: t('Screens.CredentialOffer'),
        ...screenOptions.openIdCredDetailScreenOptions
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDProofPresentation}
        component={OpenIDProofPresentation}
        options={{
          title: t('Screens.ProofRequest'),
          ...screenOptions.openIdProofPresScreenOptions
        }}
      />
    </Stack.Navigator>
  )
}

export default DeliveryStack
