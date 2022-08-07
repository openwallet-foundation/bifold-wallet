import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import SettingsCog from '../components/misc/SettingsCog'
import { useTheme } from '../contexts/theme'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
import WebDisplay from '../screens/WebDisplay'
import { HomeStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          headerRight: () => <SettingsCog />,
        })}
      />
      <Stack.Screen name={Screens.Notifications} component={ListNotifications} />
      <Stack.Screen name={Screens.WebDisplay} component={WebDisplay} />
    </Stack.Navigator>
  )
}

export default HomeStack
