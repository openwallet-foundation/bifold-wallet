import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { mainColor } from '../globalStyles'

import ContactStack from './ContactStack'
import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'
import SettingStack from './SettingStack'

export type TabStackParams = {
  HomeTab: undefined
  ContactsTab: undefined
  ScanTab: undefined
  CredentialsTab: undefined
  SettingsTab: undefined
}

const Tab = createBottomTabNavigator<TabStackParams>()

function TabStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: mainColor, elevation: 0, shadowOpacity: 0, borderTopWidth: 0 },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={30} />,
          headerTitle: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="supervisor-account" color={color} size={33} />,
          headerTitle: 'Contacts',
          tabBarLabel: 'Contacts',
        }}
      />
      <Tab.Screen
        name="ScanTab"
        options={{
          tabBarIcon: ({ color }) => <Icon name="add-box" color={color} size={30} />,
          headerTitle: 'Scan',
          tabBarLabel: 'Scan',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.navigate('Connect')
          },
        })}
      >
        {/* Just a placeholder, the the tab will navigate to a different stack */}
        {() => <View />}
      </Tab.Screen>
      <Tab.Screen
        name="CredentialsTab"
        component={CredentialStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="book" color={color} size={28} />,
          headerTitle: 'Credentials',
          tabBarLabel: 'Credentials',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={29} />,
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  )
}

export default TabStack
