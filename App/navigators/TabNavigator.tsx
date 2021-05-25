import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'

import HomeStack from './HomeStack'
import ContactStack from './ContactStack'
import CredentialStack from './CredentialStack'
import SettingStack from './SettingStack'

const Tab = createBottomTabNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator tabBarOptions={{ style: { backgroundColor: '#35823f' }, activeTintColor: 'white' }}>
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
