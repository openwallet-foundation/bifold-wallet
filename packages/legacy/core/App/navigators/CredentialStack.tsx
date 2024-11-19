import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'
import OpenIDCredentialDetails from '../modules/openid/screens/OpenIDCredentialOffer'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [screenOptions] = useServices([TOKENS.SCREEN_OPTIONS])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ({
          title: t('Screens.Credentials'),
          headerLeft: () => <SettingsMenu />,
          ...screenOptions.credentialsScreenOptions
        })}
      />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{
          title: t('Screens.CredentialDetails'),
          ...screenOptions.credentialDetailsScreenOptions
        }}
      />
      <Stack.Screen
        name={Screens.OpenIDCredentialDetails}
        component={OpenIDCredentialDetails}
        options={{
          title: t('Screens.CredentialDetails'),
          ...screenOptions.openIdCredDetailScreenOptions
        }}
      />
    </Stack.Navigator>
  )
}

export default CredentialStack
