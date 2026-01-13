import { useAgent } from '@credo-ts/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState, Linking, StyleSheet, Switch, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { ThemedText } from '../components/texts/ThemedText'
import PushNotificationsContent from '../components/views/PushNotificationsContent'
import PushNotificationsDisabledContent from '../components/views/PushNotificationsDisabledContent'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import ScreenWrapper from '../components/views/ScreenWrapper'

// Screen accesible through settings that allows the user to
// enable or disable push notifications
const TogglePushNotifications: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { ColorPalette, Spacing } = useTheme()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])
  const [notificationState, setNotificationState] = useState<boolean>(store.preferences.usePushNotifications)
  const [notificationStatus, setNotificationStatus] = useState<'denied' | 'granted' | 'unknown'>('unknown')

  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }

  const styles = StyleSheet.create({
    toggleContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
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

  const controls = hasNotificationsDisabled ? (
    <Button
      buttonType={ButtonType.Primary}
      title={t('PushNotifications.OpenSettings')}
      accessibilityLabel={t('PushNotifications.OpenSettings')}
      testID={testIdWithKey('PushNotificationSettings')}
      onPress={() => Linking.openSettings()}
    />
  ) : (
    <View style={styles.toggleContainer}>
      <ThemedText>{t('PushNotifications.ReceiveNotifications')}</ThemedText>
      <Switch
        trackColor={{ false: ColorPalette.grayscale.lightGrey, true: ColorPalette.brand.primaryDisabled }}
        thumbColor={notificationState ? ColorPalette.brand.primary : ColorPalette.grayscale.mediumGrey}
        ios_backgroundColor={ColorPalette.grayscale.lightGrey}
        onValueChange={toggleSwitch}
        accessibilityLabel={t('PushNotifications.ReceiveNotifications')}
        accessibilityRole="switch"
        testID={testIdWithKey('PushNotificationSwitch')}
        value={notificationState}
      />
    </View>
  )

  return (
    <ScreenWrapper controls={controls} padded>
      {hasNotificationsDisabled ? <PushNotificationsDisabledContent /> : <PushNotificationsContent />}
    </ScreenWrapper>
  )
}

export default TogglePushNotifications
