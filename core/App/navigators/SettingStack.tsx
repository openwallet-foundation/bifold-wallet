import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import Language from '../screens/Language'
import PinCreate from '../screens/PinCreate'
import PinRecreate from '../screens/PinRecreate'
import Settings from '../screens/Settings'
import UseBiometry from '../screens/UseBiometry'
import { Screens, SettingStackParams } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Settings} component={Settings} options={{ title: t('Screens.Settings') }} />
      <Stack.Screen name={Screens.Language} component={Language} options={{ title: t('Screens.Language') }} />
      <Stack.Screen name={Screens.UseBiometry} component={UseBiometry} options={{ title: t('Screens.Biometry') }} />
      <Stack.Screen name={Screens.RecreatePin} component={PinRecreate} options={{ title: t('Screens.ChangePin') }} />
      <Stack.Screen name={Screens.CreatePin} component={PinCreate} options={{ title: t('Screens.ChangePin') }} />
    </Stack.Navigator>
  )
}

export default SettingStack
