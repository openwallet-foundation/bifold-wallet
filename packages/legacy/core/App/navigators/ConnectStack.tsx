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
  const [scan, screenOptions] = useServices([TOKENS.SCREEN_SCAN, TOKENS.SCREEN_OPTIONS])
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
      options={{ headerBackTestID: testIdWithKey('Back'),
        ...screenOptions.scanScreenOptions
       }} />
      <Stack.Screen
        name={Screens.PasteUrl}
        component={PasteUrl}
        options={() => ({
          title: t('PasteUrl.PasteUrl'),
          headerBackTestID: testIdWithKey('Back'),
          ...screenOptions.pasteUrlScreenOptions
        })}
      />
      <Stack.Screen
        name={Screens.ScanHelp}
        component={ScanHelp}
        options={{...screenOptions.scanHelpScreenOptions}}
      />
      <Stack.Screen
        name={Screens.NameWallet}
        component={NameWallet}
        options={{
          title: t('Screens.NameWallet'),
          headerBackTestID: testIdWithKey('Back'),
          ...screenOptions.nameWalletScreenOptions
        }}
      />
    </Stack.Navigator>
  )
}

export default ConnectStack
