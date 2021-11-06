import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Settings from '../screens/Settings'
import defaultStackOptions from './defaultStackOptions'
import { useTranslation } from 'react-i18next'
import Language from '../screens/Language'

const Stack = createStackNavigator()

function SettingStack() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen options={{ title: t('SettingStack.settings') }} name="Settings" component={Settings} />
      <Stack.Screen options={{ title: t('SettingStack.language') }} name="Language" component={Language} />
    </Stack.Navigator>
  )
}

export default SettingStack
