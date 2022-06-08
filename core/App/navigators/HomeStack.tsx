import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { uiConfig } from '../../configs/uiConfig'
import SettingsCog from '../components/misc/SettingsCog'
import { useTheme } from '../contexts/theme'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
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
        options={() =>
          !uiConfig.fiveTabDisplay
            ? {
                headerRight: () => <SettingsCog />,
              }
            : {}
        }
      />
      <Stack.Screen name={Screens.Notifications} component={ListNotifications} />
    </Stack.Navigator>
  )
}

export default HomeStack
