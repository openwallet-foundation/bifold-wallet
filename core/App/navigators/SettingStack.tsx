import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Language from '../screens/Language'
import Settings from '../screens/Settings'
import { Screens, SettingStackParams } from '../types/navigators'
import { useThemeContext } from '../utils/themeContext'

import { createDefaultStackOptions } from './defaultStackOptions'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingStackParams>()
  const { t } = useTranslation()
  const theme = useThemeContext()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Settings} component={Settings} options={{ headerBackTitle: t('Global.Back') }} />
      <Stack.Screen name={Screens.Language} component={Language} />
    </Stack.Navigator>
  )
}

export default SettingStack
