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
                  ...TabTheme.tabTextStyle,
                  color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                }}
              >
                {t('TabStack.Home')}
              </Text>
            ),
            tabBarAccessibilityLabel: t('TabStack.Home'),
          }}
        />
        { fiveTabDisplay &&
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
                    ...TabTheme.tabTextStyle,
                    color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                  }}
                >
                  {t('TabStack.Credentials')}
                </Text>
              ),
              tabBarAccessibilityLabel: t('TabStack.Credentials'),
            }}
          />
        }
        <Tab.Screen
          name={TabStacks.ConnectStack}
          component={ConnectStack}
          options={{
            tabBarIcon: ({focused}) => (
              <View style={[TabTheme.focusTabIconStyle, focused && TabTheme.focusTabActiveTintColor]}>
                <Icon
                  name="qrcode-scan"
                  color={TabTheme.tabBarInactiveTintColor}
                  size={32}
                  style={{ paddingLeft: 0.5, paddingTop: 0.5 }}
                />
              </View>
            ),
            tabBarLabel: ({focused}) => {
              if (showScanLabel) {
                return scanLabelTrue(focused, TabTheme, t)
              } else {
                return scanLabelFalse()
              }
            },
            tabBarAccessibilityLabel: t('TabStack.Scan'),
          }}
        />
        { fiveTabDisplay ? 
        <>
          <Tab.Screen
            name={TabStacks.ContactStack}
            component={ContactStack}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Icon name={focused ? 'account-multiple' : 'account-multiple-outline'} color={color} size={30} />
              ),
              tabBarBadge: total || undefined,
              tabBarBadgeStyle: { backgroundColor: ColorPallet.semantic.error },
              tabBarLabel: ({ focused }) => (
                <Text
                  style={{
                    ...TabTheme.tabTextStyle,
                    color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                  }}
                >
                  {t('TabStack.Contacts')}
                </Text>
              ),
              tabBarAccessibilityLabel: t('TabStack.Contacts'),
            }}
          />
          <Tab.Screen
            name={TabStacks.SettingStack}
            component={SettingStack}
            options={{
              tabBarIcon: ({ color, focused }) => <Icon name={focused ? 'cog' : 'cog-outline'} color={color} size={30} />,
              tabBarLabel: ({ focused }) => (
                <Text
                  style={{
                    ...TabTheme.tabTextStyle,
                    color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                  }}
                >
                  {t('TabStack.Settings')}
                </Text>
              ),
              tabBarAccessibilityLabel: t('TabStack.Settings'),
            }}
          />
        </>
        :
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
                    ...TabTheme.tabTextStyle,
                    color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                  }}
                >
                  {t('TabStack.Credentials')}
                </Text>
              ),
              tabBarAccessibilityLabel: t('TabStack.Credentials'),
            }}
          />
        }
      </Tab.Navigator>
    </SafeAreaView>
  )
}

const scanLabelTrue = (focused: any, TabTheme: any, t: any) => (
  <Text
    style={{
      ...TabTheme.tabTextStyle,
      color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
    }}
  >
    {t('TabStack.Scan')}
  </Text>
)

const scanLabelFalse = () => {null}

export default TabStack
