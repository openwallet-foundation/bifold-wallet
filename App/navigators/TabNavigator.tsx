import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/MaterialIcons'

import HomeStack from './HomeStack'
import ContactStack from './ContactStack'
import ScanStack from './ScanStack'
import CredentialStack from './CredentialStack'
import SettingStack from './SettingStack'

import { mainColor } from '../globalStyles'
import { useTranslation } from 'react-i18next'

const Tab = createBottomTabNavigator()

function TabNavigator() {
  const { t } = useTranslation()
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
        options={{ title:t('TabNavigator.home') ,tabBarIcon: ({ color }) => <Icon name="home" color={color} size={30} /> }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactStack}
        options={{ title:t('TabNavigator.contacts') ,tabBarIcon: ({ color }) => <Icon name="supervisor-account" color={color} size={33} /> }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{ title:t('TabNavigator.scan') ,tabBarIcon: ({ color }) => <Icon name="add-box" color={color} size={30} /> }}
      />
      <Tab.Screen
        name="Credentials"
        component={CredentialStack}
        options={{ title:t('TabNavigator.credentials') ,tabBarIcon: ({ color }) => <Icon name="book" color={color} size={28} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingStack}
        options={{ title:t('TabNavigator.settings') ,tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={29} /> }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator
