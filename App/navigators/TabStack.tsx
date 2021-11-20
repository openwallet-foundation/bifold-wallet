import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
        accessible={true}
        accessibilityLabel={t('TabStack.Home')}
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={30} />,
          headerTitle: t('TabStack.Home'),
          tabBarLabel: t('TabStack.Home'),
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        accessible={true}
        accessibilityLabel={t('TabStack.Contacts')}
        component={ContactStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="supervisor-account" color={color} size={33} />,
          headerTitle: t('TabStack.Contacts'),
          tabBarLabel: t('TabStack.Contacts'),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        accessible={true}
        accessibilityLabel={t('TabStack.Scan')}
        options={{
          tabBarIcon: ({ color }) => <Icon name="add-box" color={color} size={30} />,
          headerTitle: t('TabStack.Scan'),
          tabBarLabel: t('TabStack.Scan'),
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
        accessible={true}
        accessibilityLabel={t('TabStack.Credentials')}
        component={CredentialStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="book" color={color} size={28} />,
          headerTitle: t('TabStack.Credentials'),
          tabBarLabel: t('TabStack.Credentials'),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        accessible={true}
        accessibilityLabel={t('TabStack.Settings')}
        component={SettingStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={29} />,
          headerTitle: t('TabStack.Settings'),
          tabBarLabel: t('TabStack.Settings'),
        }}
      />
    </Tab.Navigator>
  )
}

export default TabStack
