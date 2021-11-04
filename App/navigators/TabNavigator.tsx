import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { mainColor } from '../globalStyles'

import ContactStack from './ContactStack'
import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'
import ScanStack from './ScanStack'
import SettingStack from './SettingStack'

export type TabNavigatorParams = {
  Home: undefined
  Contacts: undefined
  Scan: undefined
  Credentials: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<TabNavigatorParams>()

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        style: { backgroundColor: mainColor, elevation: 0, shadowOpacity: 0, borderTopWidth: 0 },
        activeTintColor: 'white',
        inactiveTintColor: 'rgba(255,255,255,0.3)',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="home" color={color} size={30} /> }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="supervisor-account" color={color} size={33} /> }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="add-box" color={color} size={30} /> }}
      />
      <Tab.Screen
        name="Credentials"
        component={CredentialStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="book" color={color} size={28} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingStack}
        options={{ tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={29} /> }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator
