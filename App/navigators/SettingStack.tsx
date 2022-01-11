import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Language from '../screens/Language'
import Settings from '../screens/Settings'

import defaultStackOptions from './defaultStackOptions'

import { SettingsStackParams } from 'types/navigators'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingsStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Language" component={Language} />
    </Stack.Navigator>
  )
}

export default SettingStack
