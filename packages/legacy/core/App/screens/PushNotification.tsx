import { useAgent } from '@credo-ts/react-hooks'
import { CommonActions, ParamListBase, useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// import { setup } from '../utils/PushNotificationsHelper'
import Button, { ButtonType } from '../components/buttons/Button'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'

const PushNotification: React.FC<StackScreenProps<ParamListBase, Screens.UsePushNotifications>> = ({ route }) => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { TextTheme, ColorPallet, Assets } = useTheme()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])
  const [notificationState, setNotificationState] = useState<boolean>(store.preferences.usePushNotifications)
  const [notificationStatus, setNotificationStatus] = useState<'denied' | 'granted' | 'unknown'>('unknown')
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }
  const isMenu = (route.params as any)?.isMenu
  const updateNotificationState = async () => {
    const status = await enablePushNotifications.status()
    setNotificationStatus(status)
  }
  useMemo(() => {
    updateNotificationState()
    AppState.addEventListener('change', updateNotificationState)
  }, [])

  const style = StyleSheet.create({
    screenContainer: {
      flex: 1,
      padding: 30,
    },

    image: {
      height: 200,
      marginBottom: 20,
    },
    heading: {
      marginBottom: 20,
    },
    listItem: {
      ...TextTheme.normal,
      flex: 1,
      paddingLeft: 5,
    },
  })
  const list = [
    t('PushNotifications.BulletOne'),
    t('PushNotifications.BulletTwo'),
    t('PushNotifications.BulletThree'),
    t('PushNotifications.BulletFour'),
  ]
  const settingsInstructions = [
    t('PushNotifications.InstructionsOne'),
    t('PushNotifications.InstructionsTwo'),
    t('PushNotifications.InstructionsThree'),
  ]

  const hasNotificationsDisabled = notificationStatus === 'denied' && store.onboarding.didConsiderPushNotifications

  const activatePushNotifications = async () => {
    const state = await enablePushNotifications.setup()
    dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [state === 'granted'] })
    if (store.onboarding.postAuthScreens.length) {
      const screens: string[] = store.onboarding.postAuthScreens
      screens.shift()
      dispatch({ type: DispatchAction.SET_POST_AUTH_SCREENS, payload: [screens] })
      if (screens.length) {
        navigation.navigate(screens[0] as never)
      } else {
        navigation.navigate(Screens.Splash as never)
      }
    } else if (store.preferences.enableWalletNaming) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.NameWallet }],
        })
      )
    } else {
      dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
    }
  }

  const toggleSwitch = async () => {
    if (agent) {
      if (!notificationState) {
        const res = await enablePushNotifications.setup()
        if (res === 'denied') {
          return
        }
      }
      dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [!notificationState] })
      enablePushNotifications.toggle(!notificationState, agent)
      setNotificationState(!notificationState)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={style.screenContainer}>
          {!hasNotificationsDisabled && (
            <View style={style.image}>
              <Assets.svg.pushNotificationImg />
            </View>
          )}
          <Text style={[TextTheme.headingThree, style.heading]}>{t('PushNotifications.EnableNotifiactions')}</Text>
          {hasNotificationsDisabled ? (
            <View>
              <Text style={TextTheme.normal}>{t('PushNotifications.NotificationsOffMessage')}</Text>
            </View>
          ) : (
            <>
              <Text style={TextTheme.normal}>{t('PushNotifications.BeNotified')}</Text>
              {list.map((item, index) => (
                <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
                  <Text style={TextTheme.normal}>{'\u2022'}</Text>
                  <Text style={style.listItem}>{item}</Text>
                </View>
              ))}
            </>
          )}
          {isMenu ? (
            <>
              <View style={{ marginTop: 25 }}>
                {hasNotificationsDisabled ? (
                  <View>
                    <Text style={TextTheme.bold}>{t('PushNotifications.NotificationsOffTitle')}</Text>
                    <Text style={TextTheme.normal}>{t('PushNotifications.NotificationsInstructionTitle')}</Text>
                    {settingsInstructions.map((item, index) => (
                      <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
                        <Text style={TextTheme.normal}>{`${index + 1}. `}</Text>
                        <Text style={style.listItem}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={TextTheme.normal}>{t('PushNotifications.ReceiveNotifications')}</Text>
                    <Switch
                      trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
                      thumbColor={notificationState ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
                      ios_backgroundColor={ColorPallet.grayscale.lightGrey}
                      onValueChange={toggleSwitch}
                      accessibilityLabel={t('PushNotifications.ReceiveNotifications')}
                      accessibilityRole="switch"
                      testID={testIdWithKey('PushNotificationSwitch')}
                      value={notificationState}
                    />
                  </View>
                )}
              </View>
              {hasNotificationsDisabled && (
                <View style={{ marginTop: 'auto' }}>
                  <Button
                    buttonType={ButtonType.Primary}
                    title={t('PushNotifications.OpenSettings')}
                    accessibilityLabel={t('PushNotifications.OpenSettings')}
                    testID={testIdWithKey('PushNotificationSettings')}
                    onPress={() => Linking.openSettings()}
                  ></Button>
                </View>
              )}
            </>
          ) : (
            <View style={{ marginTop: 'auto' }}>
              <Button
                buttonType={ButtonType.Primary}
                title={t('Global.Continue')}
                accessibilityLabel={t('Global.Continue')}
                testID={testIdWithKey('PushNotificationContinue')}
                onPress={activatePushNotifications}
              ></Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PushNotification
