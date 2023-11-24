import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useWindowDimensions, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { AttachTourStep } from '../components/tour/AttachTourStep'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks, TabStackParams, TabStacks } from '../types/navigators'
import { TourID } from '../types/tour'
import { isTablet, orientation, Orientation } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'

const TabStack: React.FC = () => {
  const { width, height, fontScale } = useWindowDimensions()
  const { useCustomNotifications, enableReuseConnections, enableImplicitInvitations } = useConfiguration()
  const { total } = useCustomNotifications()
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()
  const { assertConnectedNetwork } = useNetwork()
  const { ColorPallet, TabTheme } = useTheme()
  const showLabels = fontScale * TabTheme.tabBarTextStyle.fontSize < 18
  const styles = StyleSheet.create({
    tabBarIcon: {
      flex: 1,
    },
  })

  const leftMarginForDevice = (width: number, height: number) => {
    if (isTablet(width, height)) {
      return orientation(width, height) === Orientation.Portrait ? 130 : 170
    }

    return 0
  }

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
            tabBarIconStyle: styles.tabBarIcon,
            tabBarIcon: ({ color, focused }) => (
              <AttachTourStep tourID={TourID.HomeTour} index={1}>
                <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                  <Icon name={focused ? 'message-text' : 'message-text-outline'} color={color} size={30} />

                  {showLabels && (
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                        fontWeight: focused ? 'bold' : 'normal',
                      }}
                    >
                      {t('TabStack.Home')}
                    </Text>
                  )}
                </View>
              </AttachTourStep>
            ),
            tabBarShowLabel: false,
            tabBarAccessibilityLabel: `${t('TabStack.Home')} (${
              total === 1 ? t('Home.OneNotification') : t('Home.CountNotifications', { count: total || 0 })
            })`,
            tabBarTestID: testIdWithKey(t('TabStack.Home')),
            tabBarBadge: total || undefined,
            tabBarBadgeStyle: {
              marginLeft: leftMarginForDevice(width, height),
              backgroundColor: ColorPallet.semantic.error,
            },
          }}
        />
        <Tab.Screen
          name={TabStacks.ConnectStack}
          options={{
            tabBarIconStyle: styles.tabBarIcon,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  position: 'relative',
                  flex: 1,
                  width: 90,
                }}
              >
                <AttachTourStep tourID={TourID.HomeTour} index={0} fill>
                  <View
                    style={{
                      position: 'absolute',
                      flexGrow: 1,
                      width: 90,
                      bottom: 0,
                      minHeight: 90,
                      margin: 'auto',
                    }}
                  >
                    <AttachTourStep tourID={TourID.CredentialsTour} index={0} fill>
                      <View
                        style={{
                          flexGrow: 1,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          accessible={true}
                          accessibilityRole={'button'}
                          accessibilityLabel={t('TabStack.Scan')}
                          style={{ ...TabTheme.focusTabIconStyle }}
                        >
                          <Icon
                            accessible={false}
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
              navigation.navigate(Stacks.ConnectStack, {
                screen: Screens.Scan,
                params: {
                  implicitInvitations: enableImplicitInvitations,
                  reuseConnections: enableReuseConnections,
                },
              })
            },
          })}
        >
          {() => <View />}
        </Tab.Screen>
        <Tab.Screen
          name={TabStacks.CredentialStack}
          component={CredentialStack}
          options={{
            tabBarIconStyle: styles.tabBarIcon,
            tabBarIcon: ({ color, focused }) => (
              <AttachTourStep tourID={TourID.HomeTour} index={2}>
                <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                  <Icon name={focused ? 'wallet' : 'wallet-outline'} color={color} size={30} />
                  {showLabels && (
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                        fontWeight: focused ? 'bold' : 'normal',
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
