import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import SettingsMenu from '../components/buttons/SettingsMenu'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import HistoryMenu from '../modules/history/ui/components/HistoryMenu'
import Home from '../screens/Home'
import { HomeStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const [store] = useStore()
  const defaultStackOptions = useDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t('Screens.Home'),
          headerRight: () => (store.preferences.useHistoryCapability ? <HistoryMenu /> : null),
          headerLeft: () => <SettingsMenu />,
        })}
      />
    </Stack.Navigator>
  )
}

export default HomeStack
