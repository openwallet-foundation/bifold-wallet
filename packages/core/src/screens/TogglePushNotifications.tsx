import { useAgent } from '@credo-ts/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { ThemedText } from '../components/texts/ThemedText'
import PushNotificationsContent from '../components/views/PushNotificationsContent'
import PushNotificationsDisabledContent from '../components/views/PushNotificationsDisabledContent'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

// Screen accesible through settings that allows the user to
// enable or disable push notifications
const TogglePushNotifications: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { ColorPallet } = useTheme()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])
  const [notificationState, setNotificationState] = useState<boolean>(store.preferences.usePushNotifications)
  const [notificationStatus, setNotificationStatus] = useState<'denied' | 'granted' | 'unknown'>('unknown')

  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }

  const styles = StyleSheet.create({
    screenContainer: {
      flex: 1,
      padding: 30,
    },
    toggleContainer: {
      marginTop: 25,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    controlsContainer: {
      marginTop: 'auto',
    },
  })

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

  const toggleSwitch = async () => {
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.screenContainer}>
          {hasNotificationsDisabled ? (
            <>
              <PushNotificationsDisabledContent />
              <View style={styles.controlsContainer}>
                <Button
                  buttonType={ButtonType.Primary}
                  title={t('PushNotifications.OpenSettings')}
                  accessibilityLabel={t('PushNotifications.OpenSettings')}
                  testID={testIdWithKey('PushNotificationSettings')}
                  onPress={() => Linking.openSettings()}
                />
              </View>
            </>
          ) : (
            <>
              <PushNotificationsContent />
              <View style={styles.toggleContainer}>
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TogglePushNotifications
