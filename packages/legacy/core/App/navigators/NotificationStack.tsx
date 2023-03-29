import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderRightHome'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import CommonDecline from '../screens/CommonDecline'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialOffer from '../screens/CredentialOffer'
import ProofRequest from '../screens/ProofRequest'
import { NotificationStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const NotificationStack: React.FC = () => {
  const Stack = createStackNavigator<NotificationStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { customNotification } = useConfiguration()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{ title: t('Screens.CredentialDetails') }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer') }}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{ title: t('Screens.ProofRequest') }}
      />
      <Stack.Screen
        name={Screens.CustomNotification}
        component={customNotification.component}
        options={{ title: t(customNotification.pageTitle as any) }}
      />
      <Stack.Screen
        name={Screens.CommonDecline}
        component={CommonDecline}
        options={() => ({
          title: t('Screens.Decline'),
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          headerShown: true,
          presentation: 'modal',
          headerLeft: () => null,
          headerRight: () => <HeaderRightHome />,
        })}
      />
    </Stack.Navigator>
  )
}

export default NotificationStack
