import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import HistoryMenu from '../modules/history/ui/components/HistoryMenu'
import HomeScreen from '../screens/HomeScreen'
import RequestCredential from '../screens/RequestCredential'
import DocumentTypeSelectionScreen from '../screens/DocumentTypeSelectionScreen';
import EmployementDocumentScreen from '../screens/EmployementDocumentScreen';
import Onfido from '../screens/Onfido'

import CredentialProof from '../screens/CredentialProofScreen'

import { HomeStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ScreenOptionsDictionary, historyEnabled] = useServices([TOKENS.OBJECT_SCREEN_CONFIG, TOKENS.HISTORY_ENABLED])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.HomeScreen}
        component={HomeScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen name={Screens.RequestCredential} component={RequestCredential}
        options={() => ({
          headerShown: false,
        })} />
      <Stack.Screen name={Screens.DocumentType} component={DocumentTypeSelectionScreen}
        options={() => ({
          headerShown: false,
        })}
      />
      <Stack.Screen name={Screens.EmployementDocument} component={EmployementDocumentScreen}
        options={() => ({
          headerShown: false,
        })}
      />

      <Stack.Screen name={Screens.CredentialProof} component={CredentialProof}
        options={() => ({
          headerShown: false,
        })}
      />

      <Stack.Screen name={Screens.Onfido} component={Onfido}
        options={() => ({
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  )
}

export default HomeStack
