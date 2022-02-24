import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import Language from '../screens/Language'
import Settings from '../screens/Settings'
import { Screens, SettingsStackParams, Stacks } from '../types/navigators'

import ContactStack from './ContactStack'
import defaultStackOptions from './defaultStackOptions'

const SettingStack: React.FC = () => {
  const Stack = createStackNavigator<SettingsStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Settings} component={Settings} />
      <Stack.Screen name={Screens.Language} component={Language} />
      <Stack.Screen name={Stacks.ContactStack} component={ContactStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default SettingStack
