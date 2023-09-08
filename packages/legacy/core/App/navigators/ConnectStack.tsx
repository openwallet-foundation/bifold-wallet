import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import NameWallet from '../screens/NameWallet'
import { ConnectStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const { scan } = useConfiguration()
  const { t } = useTranslation()
  const [store] = useStore()
  return (
    <Stack.Navigator
      // below is part of the temporary gating of the new scan screen tabs feature
      screenOptions={{ ...defaultStackOptions, headerShown: store.preferences.useConnectionInviterCapability }}
    >
      <Stack.Screen name={Screens.Scan} component={scan} />
      <Stack.Screen
        name={Screens.NameWallet}
        component={NameWallet}
        options={{ title: t('Screens.NameWallet'), headerBackTestID: testIdWithKey('Back') }}
      />
    </Stack.Navigator>
  )
}

export default ConnectStack
