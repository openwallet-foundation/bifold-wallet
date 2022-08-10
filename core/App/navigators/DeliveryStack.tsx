import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderLeftBack from '../components/buttons/HeaderLeftBack'
import HeaderRightHome from '../components/buttons/HeaderRightHome'
import { useTheme } from '../contexts/theme'
import CommonDecline from '../screens/CommonDecline'
import Connection from '../screens/Connection'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import ProofRequestAttributeDetails from '../screens/ProofRequestAttributeDetails'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const DeliveryStack: React.FC = () => {
  const Stack = createStackNavigator<DeliveryStackParams>()
  const { t } = useTranslation()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)

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
      }}
    >
      <Stack.Screen name={Screens.Connection} component={Connection} options={{ ...defaultStackOptions }} />
      <Stack.Screen name={Screens.ProofRequest} component={ProofRequest} />
      <Stack.Screen
        name={Screens.ProofRequestAttributeDetails}
        component={ProofRequestAttributeDetails}
        options={({ navigation }) => ({
          presentation: 'card',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          title: t('ProofRequest.Details'),
          headerRight: undefined,
          headerLeft: () => (
            <HeaderLeftBack
              title={t('Global.Back')}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      />
      <Stack.Screen name={Screens.CredentialOffer} component={CredentialOffer} />
      <Stack.Screen name={Screens.CommonDecline} component={CommonDecline} />
    </Stack.Navigator>
  )
}

export default DeliveryStack
