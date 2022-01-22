import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors } from '../theme'

import ContactStack from './ContactStack'
import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'
import SettingStack from './SettingStack'

import { TabStackParams } from 'types/navigators'

const TabStack: React.FC = () => {
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.primary, elevation: 0, shadowOpacity: 0, borderTopWidth: 0 },
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="home" color={color} size={30} />,
          headerTitle: t('TabStack.Home'),
          tabBarLabel: t('TabStack.Home'),
          tabBarAccessibilityLabel: t('TabStack.Home'),
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="supervisor-account" color={color} size={33} />,
          headerTitle: t('TabStack.Contacts'),
          tabBarLabel: t('TabStack.Contacts'),
          tabBarAccessibilityLabel: t('TabStack.Contacts'),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        options={{
          tabBarIcon: ({ color }) => <Icon name="add-box" color={color} size={30} />,
          headerTitle: t('TabStack.Scan'),
          tabBarLabel: t('TabStack.Scan'),
          tabBarAccessibilityLabel: t('TabStack.Scan'),
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
          headerTitle: t('TabStack.Credentials'),
          tabBarLabel: t('TabStack.Credentials'),
          tabBarAccessibilityLabel: t('TabStack.Credentials'),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingStack}
        options={{
          tabBarIcon: ({ color }) => <Icon name="settings" color={color} size={29} />,
          headerTitle: t('TabStack.Settings'),
          tabBarLabel: t('TabStack.Settings'),
          tabBarAccessibilityLabel: t('TabStack.Settings'),
        }}
      />
    </Tab.Navigator>
  )
}

export default TabStack
