import { useAgent } from '@credo-ts/react-hooks'
import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'
import { ThemedText } from '../components/texts/ThemedText'

const PushNotification: React.FC<StackScreenProps<ParamListBase, Screens.UsePushNotifications>> = ({ route }) => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { TextTheme, ColorPallet, Assets } = useTheme()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])
  const [notificationState, setNotificationState] = useState<boolean>(store.preferences.usePushNotifications)
  const [notificationStatus, setNotificationStatus] = useState<'denied' | 'granted' | 'unknown'>('unknown')
  const isMenu = (route.params as any)?.isMenu

  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }

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

  useEffect(() => {
    const updateNotificationState = async () => {
      const status = await enablePushNotifications.status()
      setNotificationStatus(status)
    }

    updateNotificationState()
    const subscription = AppState.addEventListener('change', updateNotificationState)

    return () => subscription.remove()
  }, [enablePushNotifications])

  const hasNotificationsDisabled = notificationStatus === 'denied' && store.onboarding.didConsiderPushNotifications

  const activatePushNotifications = async () => {
    const state = await enablePushNotifications.setup()

    dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [state === 'granted'] })
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
          <ThemedText variant="headingThree" style={style.heading}>
            {t('PushNotifications.EnableNotifiactions')}
          </ThemedText>
          {hasNotificationsDisabled ? (
            <View>
              <ThemedText>{t('PushNotifications.NotificationsOffMessage')}</ThemedText>
            </View>
          ) : (
            <>
              <ThemedText>{t('PushNotifications.BeNotified')}</ThemedText>
              {list.map((item, index) => (
                <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
                  <ThemedText>{'\u2022'}</ThemedText>
                  <ThemedText style={style.listItem}>{item}</ThemedText>
                </View>
              ))}
            </>
          )}
          {isMenu ? (
            <>
              <View style={{ marginTop: 25 }}>
                {hasNotificationsDisabled ? (
                  <View>
                    <ThemedText variant="bold">{t('PushNotifications.NotificationsOffTitle')}</ThemedText>
                    <ThemedText>{t('PushNotifications.NotificationsInstructionTitle')}</ThemedText>
                    {settingsInstructions.map((item, index) => (
                      <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
                        <ThemedText>{`${index + 1}. `}</ThemedText>
                        <ThemedText style={style.listItem}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText>{t('PushNotifications.ReceiveNotifications')}</ThemedText>
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
