import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import { Screens, MoreStackParams, EstablishedConnectionStackParams } from '../types/navigators'
import SettingsMenu from '../components/buttons/SettingsMenu'
import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'
import EstablishedConnection from '../screens/EstablishedConnection'

const MoreStack: React.FC = () => {
  const Stack = createStackNavigator<EstablishedConnectionStackParams>()
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
        name={Screens.EstablishedConnection}
        component={EstablishedConnection}
        options={() => ({
        headerShown: false,
        })}
      />
    </Stack.Navigator>
  )
}

export default MoreStack
