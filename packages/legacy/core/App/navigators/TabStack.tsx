import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { AttachTourStep } from '../components/tour/AttachTourStep'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks, TabStackParams, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'

const TabStack: React.FC = () => {
  const { useCustomNotifications } = useConfiguration()
  const { total } = useCustomNotifications()
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()
  const { assertConnectedNetwork } = useNetwork()
  const { ColorPallet, TabTheme } = useTheme()
  const { fontScale } = useWindowDimensions()

  const showLabels = fontScale * TabTheme.tabBarTextStyle.fontSize < 18

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ColorPallet.brand.primary }}>
      <Tab.Navigator
        screenOptions={{
          unmountOnBlur: true,
          tabBarStyle: {
            ...TabTheme.tabBarStyle,
          },
          tabBarActiveTintColor: TabTheme.tabBarActiveTintColor,
          tabBarInactiveTintColor: TabTheme.tabBarInactiveTintColor,
          header: () => null,
        }}
      >
        <Tab.Screen
          name={TabStacks.HomeStack}
          component={HomeStack}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                <Icon name={focused ? 'home' : 'home-outline'} color={color} size={30} />
                {showLabels && (
                  <Text
                    style={{
                      ...TabTheme.tabBarTextStyle,
                      color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                    }}
                  >
                    {t('TabStack.Home')}
                  </Text>
                )}
              </View>
            ),
            tabBarShowLabel: false,
            tabBarBadge: total || undefined,
            tabBarBadgeStyle: { backgroundColor: ColorPallet.semantic.error },
            tabBarAccessibilityLabel: `${t('TabStack.Home')} (${
              total === 1 ? t('Home.OneNotification') : t('Home.CountNotifications', { count: total || 0 })
            })`,
            tabBarTestID: testIdWithKey(t('TabStack.Home')),
          }}
        />
        <Tab.Screen
          name={TabStacks.ConnectStack}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  position: 'relative',
                  flex: 1,
                  width: 90,
                }}
              >
                <AttachTourStep index={0} fill>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 90,
                      minHeight: 90,
                      flexGrow: 1,
                      margin: 'auto',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ ...TabTheme.focusTabIconStyle }}>
                      <Icon
                        name="qrcode-scan"
                        color={TabTheme.tabBarButtonIconStyle.color}
                        size={32}
                        style={{ paddingLeft: 0.5, paddingTop: 0.5 }}
                      />
                    </View>
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                        marginTop: 5,
                      }}
                    >
                      {t('TabStack.Scan')}
                    </Text>
                  </View>
                </AttachTourStep>
              </View>
            ),
            tabBarShowLabel: false,
            tabBarAccessibilityLabel: t('TabStack.Scan'),
            tabBarTestID: testIdWithKey(t('TabStack.Scan')),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault()
              if (!assertConnectedNetwork()) {
                return
              }
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
              <AttachTourStep index={2}>
                <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                  <Icon name={focused ? 'wallet' : 'wallet-outline'} color={color} size={30} />
                  {showLabels && (
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                      }}
                    >
                      {t('TabStack.Credentials')}
                    </Text>
                  )}
                </View>
              </AttachTourStep>
            ),
            tabBarShowLabel: false,
            tabBarAccessibilityLabel: t('TabStack.Credentials'),
            tabBarTestID: testIdWithKey(t('TabStack.Credentials')),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

export default TabStack
