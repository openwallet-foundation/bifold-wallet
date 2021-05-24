import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import Home from '../screens/Home'
import ListContacts from '../screens/ListContacts'
import ListCredentials from '../screens/ListCredentials'
import Settings from '../screens/Settings'

const Tab = createBottomTabNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Contacts" component={ListContacts} />
      <Tab.Screen name="Credentials" component={ListCredentials} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  )
}

export default TabNavigator
