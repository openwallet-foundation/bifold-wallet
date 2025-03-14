import { useAgent } from '@credo-ts/react-hooks'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useWindowDimensions, View, StyleSheet, DeviceEventEmitter } from 'react-native'
import { isTablet } from 'react-native-device-info'
import { OrientationType, useOrientationChange } from 'react-native-orientation-locker'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AttachTourStep } from '../components/tour/AttachTourStep'
import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useNetwork } from '../contexts/network'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, Stacks, TabStackParams, TabStacks } from '../types/navigators'
import { connectFromScanOrDeepLink } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import CredentialStack from './CredentialStack'
import HomeStack from './HomeStack'
import { BaseTourID } from '../types/tour'

const TabStack: React.FC = () => {
  const { fontScale } = useWindowDimensions()
  const [{ useNotifications }, { enableImplicitInvitations, enableReuseConnections }, logger] =
    useServices([TOKENS.NOTIFICATIONS, TOKENS.CONFIG, TOKENS.UTIL_LOGGER])
  const notifications = useNotifications({})
  const { t } = useTranslation()
  const Tab = createBottomTabNavigator<TabStackParams>()
  const { assertNetworkConnected } = useNetwork()
  const { ColorPallet, TabTheme, TextTheme, Assets } = useTheme()
  const [orientation, setOrientation] = useState(OrientationType.PORTRAIT)
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<TabStackParams>>()
  const showLabels = fontScale * TabTheme.tabBarTextStyle.fontSize < 18
  const styles = StyleSheet.create({
    tabBarIcon: {
      flex: 1,
    },
  })

  useOrientationChange((orientationType) => {
    setOrientation(orientationType)
  })

  const leftMarginForDevice = () => {
    if (isTablet()) {
      return orientation in [OrientationType.PORTRAIT, OrientationType['PORTRAIT-UPSIDEDOWN']] ? 130 : 170
    }

    return 0
  }

  const handleDeepLink = useCallback(
    async (deepLink: string) => {
      logger.info(`Handling deeplink: ${deepLink}`)

      // If it's just the general link with no params, set link inactive and do nothing
      if (deepLink.search(/oob=|c_i=|d_m=|url=/) < 0) {
        dispatch({
          type: DispatchAction.ACTIVE_DEEP_LINK,
          payload: [undefined],
        })
        return
      }

      try {
        await connectFromScanOrDeepLink(
          deepLink,
          agent,
          logger,
          navigation,
          true, // isDeepLink
          enableImplicitInvitations,
          enableReuseConnections
        )
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1039'),
          t('Error.Message1039'),
          (err as Error)?.message ?? err,
          1039
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      } finally {
        dispatch({
          type: DispatchAction.ACTIVE_DEEP_LINK,
          payload: [undefined],
        })
      }
    },
    [agent, enableImplicitInvitations, enableReuseConnections, logger, navigation, t, dispatch]
  )

  useEffect(() => {
    if (store.deepLink && agent && store.authentication.didAuthenticate) {
      handleDeepLink(store.deepLink)
    }
  }, [store.deepLink, agent, store.authentication.didAuthenticate, handleDeepLink])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ColorPallet.brand.primary }}>
      <Tab.Navigator
        initialRouteName={TabStacks.HomeStack}
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
              <AttachTourStep tourID={BaseTourID.HomeTour} index={1}>
                <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                  {focused ? (
                    <Assets.svg.tabOneFocusedIcon height={30} width={30} fill={color} stroke={color} />
                  ) : (
                    <Assets.svg.tabOneIcon height={30} width={30} fill={color} stroke={color} />
                  )}
                  {showLabels && (
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                        fontWeight: focused ? TextTheme.bold.fontWeight : TextTheme.normal.fontWeight,
                      }}
                    >
                      {t('TabStack.Home')}
                    </Text>
                  )}
                </View>
              </AttachTourStep>
            ),
            tabBarShowLabel: false,
            tabBarAccessibilityLabel: `${t('TabStack.Home')} (${notifications.length ?? 0})`,
            tabBarTestID: testIdWithKey(t('TabStack.Home')),
            tabBarBadge: notifications.length || undefined,
            tabBarBadgeStyle: {
              marginLeft: leftMarginForDevice(),
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
                <AttachTourStep tourID={BaseTourID.HomeTour} index={0} fill>
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
                    <AttachTourStep tourID={BaseTourID.CredentialsTour} index={0} fill>
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
                          <Assets.svg.tabTwoIcon
                            height={30}
                            width={30}
                            fill={TabTheme.tabBarButtonIconStyle.color}
                            style={{ paddingLeft: 0.5, paddingRight: 0.5 }}
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
              if (!assertNetworkConnected()) {
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
            tabBarIconStyle: styles.tabBarIcon,
            tabBarIcon: ({ color, focused }) => (
              <AttachTourStep tourID={BaseTourID.HomeTour} index={2}>
                <View style={{ ...TabTheme.tabBarContainerStyle, justifyContent: showLabels ? 'flex-end' : 'center' }}>
                  {focused ? (
                    <Assets.svg.tabThreeFocusedIcon height={30} width={30} fill={color} stroke={color} />
                  ) : (
                    <Assets.svg.tabThreeIcon height={30} width={30} fill={color} stroke={color} />
                  )}
                  {showLabels && (
                    <Text
                      style={{
                        ...TabTheme.tabBarTextStyle,
                        color: focused ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
                        fontWeight: focused ? TextTheme.bold.fontWeight : TextTheme.normal.fontWeight,
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
