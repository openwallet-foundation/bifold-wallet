import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens } from '../types/navigators'
import JSONDetails from '../screens/JSONDetails'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const [CredentialListHeaderRight, ScreenOptionsDictionary] = useServices([
    TOKENS.COMPONENT_CRED_LIST_HEADER_RIGHT,
    TOKENS.OBJECT_SCREEN_CONFIG,
  ])
  const defaultStackOptions = useDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ({
          title: t('Screens.Credentials'),
          headerRight: () => <CredentialListHeaderRight />,
          headerLeft: () => <SettingsMenu />,
          ...ScreenOptionsDictionary[Screens.Credentials],
        })}
      />
      <Stack.Screen
        name={Screens.JSONDetails}
        component={JSONDetails}
        options={() => ({
          title: t('Screens.JSONDetails'),
          ...ScreenOptionsDictionary[Screens.JSONDetails],
        })}
      />
    </Stack.Navigator>
  )
}

export default CredentialStack
