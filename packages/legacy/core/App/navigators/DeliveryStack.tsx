import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderHome'
import { useTheme } from '../contexts/theme'
import Connection from '../screens/Connection'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import { DeliveryStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import OpenIDProofPresentation from '../modules/openid/screens/OpenIDProofPresentation'
import { TOKENS, useServices } from '../container-api'
import OpenIDCredentialOffer from '../modules/openid/screens/OpenIDCredentialOffer'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const { t } = useTranslation()
  const theme = useTheme()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ScreenOptionsDictionary] = useServices([TOKENS.OBJECT_SCREEN_CONFIG])

  return (
    <Stack.Navigator
      initialRouteName={Screens.Connection}
      screenOptions={{
        ...defaultStackOptions,
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        headerShown: true,
        presentation: 'modal',
        headerLeft: () => null,
        headerRight: () => <HeaderRightHome />,
        ...ScreenOptionsDictionary[Screens.Connection],
      }}
    >
      <Stack.Screen name={Screens.Connection} component={Connection} options={{ ...defaultStackOptions }} />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{
          title: t('Screens.ProofRequest'),
          ...ScreenOptionsDictionary[Screens.ProofRequest],
        }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{
          title: t('Screens.CredentialOffer'),
          ...ScreenOptionsDictionary[Screens.CredentialOffer],
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialOffer}
        component={OpenIDCredentialOffer}
        options={{
          title: t('Screens.CredentialOffer'),
          ...ScreenOptionsDictionary[Screens.OpenIDCredentialOffer],
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDProofPresentation}
        component={OpenIDProofPresentation}
        options={{
          title: t('Screens.ProofRequest'),
          ...ScreenOptionsDictionary[Screens.OpenIDProofPresentation],
        }}
      />
    </Stack.Navigator>
  )
}

export default DeliveryStack
