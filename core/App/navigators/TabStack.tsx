import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../contexts/theme'
import { useNotifications } from '../hooks/notifications'
import { ColorPallet, TextTheme } from '../theme'
import { Screens, Stacks, TabStackParams, TabStacks } from '../types/navigators'

import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'

const TabStack: React.FC = () => {
  const { total } = useNotifications()
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()
  const { ColorPallet, TextTheme } = useTheme()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ColorPallet.brand.primary }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            height: 60,
            backgroundColor: ColorPallet.brand.secondaryBackground,
            shadowOffset: { width: 0, height: -3 },
            shadowRadius: 6,
            shadowColor: ColorPallet.grayscale.black,
            shadowOpacity: 0.1,
            borderTopWidth: 0,
            paddingBottom: 0,
          },
          tabBarActiveTintColor: ColorPallet.brand.primary,
          tabBarInactiveTintColor: ColorPallet.notification.infoText,
          header: () => null,
        }}
      >
        <Tab.Screen
          name={TabStacks.HomeStack}
          component={HomeStack}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? 'home' : 'home-outline'} color={color} size={30} />
            ),
            tabBarBadge: total || undefined,
            tabBarBadgeStyle: { backgroundColor: ColorPallet.semantic.error },
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  ...TextTheme.label,
                  fontWeight: 'normal',
                  paddingBottom: 5,
                  color: focused ? ColorPallet.brand.primary : ColorPallet.notification.infoText,
                }}
              >
                {t('TabStack.Home')}
              </Text>
            ),
            tabBarAccessibilityLabel: t('TabStack.Home'),
          }}
        />
        <Tab.Screen
          name={TabStacks.ConnectStack}
          options={{
            tabBarIcon: () => (
              <View
                style={{
                  height: 60,
                  width: 60,
                  backgroundColor: ColorPallet.brand.primary,
                  top: -20,
                  borderRadius: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  name="qrcode-scan"
                  color={ColorPallet.grayscale.white}
                  size={32}
                  style={{ paddingLeft: 0.5, paddingTop: 0.5 }}
                />
              </View>
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  ...TextTheme.label,
                  fontWeight: 'normal',
                  paddingBottom: 5,
                  color: focused ? ColorPallet.brand.primary : ColorPallet.notification.infoText,
                }}
              >
                {t('TabStack.Scan')}
              </Text>
            ),
            tabBarAccessibilityLabel: t('TabStack.Scan'),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault()
              navigation.navigate(Stacks.ConnectStack, { screen: Screens.Scan })
            },
          })}
        >
          {() => <View />}
        </Tab.Screen>
        <Tab.Screen
          name={TabStacks.CredentialStack}
          component={CredentialStack}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? 'wallet' : 'wallet-outline'} color={color} size={30} />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  ...TextTheme.label,
                  fontWeight: 'normal',
                  paddingBottom: 5,
                  color: focused ? ColorPallet.brand.primary : ColorPallet.notification.infoText,
                }}
              >
                {t('TabStack.Credentials')}
              </Text>
            ),
            tabBarAccessibilityLabel: t('TabStack.Credentials'),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

export default TabStack
