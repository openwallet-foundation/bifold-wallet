import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import NameWallet from '../screens/NameWallet'
import PasteUrl from '../screens/PasteUrl'
import ScanHelp from '../screens/ScanHelp'
import { ConnectStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [scan, ScreenOptionsDictionary] = useServices([TOKENS.SCREEN_SCAN, TOKENS.OBJECT_SCREEN_CONFIG])
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      <Stack.Screen
        name={Screens.Scan}
        component={scan}
        options={{
          title: t('Screens.Scan'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.Scan],
        }}
      />
      <Stack.Screen
        name={Screens.PasteUrl}
        component={PasteUrl}
        options={() => ({
          title: t('PasteUrl.PasteUrl'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.PasteUrl],
        })}
      />
      <Stack.Screen
        name={Screens.ScanHelp}
        component={ScanHelp}
        options={{
          title: t('Screens.ScanHelp'),
          ...ScreenOptionsDictionary[Screens.ScanHelp],
        }}
      />

      <Stack.Screen
        name={Screens.NameWallet}
        component={NameWallet}
        options={{
          title: t('Screens.NameWallet'),
          headerBackTestID: testIdWithKey('Back'),
          ...ScreenOptionsDictionary[Screens.NameWallet],
        }}
      />
    </Stack.Navigator>
  )
}

export default ConnectStack
