import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { TabStackParams, TabStacks } from '../types/navigators'
import { showScanLabel, fiveTabDisplay } from '../../configs/uiConfig'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'
import SettingStack from './SettingStack'

const TabStack: React.FC = () => {
  const { total } = useNotifications()
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()
  const { ColorPallet, TabTheme } = useTheme()

  const renderTabScreen = (name: TabStacks, translatedName: string, component: React.FC, iconFilled: string, iconOutline?: string) => {
    return (
      <Tab.Screen
        name={name}
        component={component}
        options={{
          tabBarIcon: ({ color, focused }) => {
            if (!iconOutline) {
              return (
                <View style={[TabTheme.focusTabIconStyle, focused && TabTheme.focusTabActiveTintColor]}>
                <Icon
                  name={iconFilled}
                  color={TabTheme.tabBarInactiveTintColor}
                  size={32}
                  style={{ paddingHorizontal: 0.5, paddingTop: 0.5 }}
                />
              </View>
              )
            }
            return <Icon name={focused ? iconFilled : iconOutline} color={color} size={30} />
          },
          tabBarBadge: name == TabStacks.HomeStack ? total || undefined : undefined,
          tabBarBadgeStyle: { backgroundColor: ColorPallet.semantic.error },
          tabBarLabel: ({ focused }) => {
            if (!iconOutline) {
              if (showScanLabel) {
                return <Text
                  style={{
                    ...TabTheme.tabTextStyle,
                    color: focused && TabTheme.tabBarInactiveTintColor,
                  }}
                >
                  {t('TabStack.Scan')}
                </Text>
              }
              return null
            }
            return <Text
              style={{
                ...TabTheme.tabTextStyle,
                color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
              }}
            >
              {translatedName}
            </Text>
            },
          tabBarAccessibilityLabel: translatedName,
        }}
      />
    )
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ColorPallet.brand.secondary }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            ...TabTheme.tabBarStyle,
          },
          tabBarActiveTintColor: TabTheme.tabBarActiveTintColor,
          tabBarInactiveTintColor: TabTheme.tabBarInactiveTintColor,
          header: () => null,
        }}
      >
        {renderTabScreen(TabStacks.HomeStack, t('TabStack.Home'), HomeStack, 'home', 'home-outline')}
        {fiveTabDisplay && 
        renderTabScreen(TabStacks.ContactStack, t('TabStack.Contacts'), ContactStack, 'account-multiple', 'account-multiple-outline')}
        {renderTabScreen(TabStacks.ConnectStack, t('TabStack.Scan'), ConnectStack, 'qrcode-scan')}
        {renderTabScreen(TabStacks.CredentialStack, t('TabStack.Credentials'), CredentialStack, 'wallet', 'wallet-outline')}
        {fiveTabDisplay && 
        renderTabScreen(TabStacks.SettingStack, t('TabStack.Settings'), SettingStack, 'cog', 'cog-outline')}
      </Tab.Navigator>
    </SafeAreaView>
  )
}

export default TabStack
