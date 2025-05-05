import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import PushNotificationsContent from '../components/views/PushNotificationsContent'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { testIdWithKey } from '../utils/testable'

// Screen to show during onboarding that prompts
// for push notification permissions
const PushNotifications: React.FC = () => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])

  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }

  const styles = StyleSheet.create({
    screenContainer: {
      flex: 1,
      padding: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
    },
  })

  const activatePushNotifications = async () => {
    const state = await enablePushNotifications.setup()
    dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [state === 'granted'] })
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.screenContainer}>
          <PushNotificationsContent />
          <View style={styles.controlsContainer}>
            <Button
              buttonType={ButtonType.Primary}
              title={t('Global.Continue')}
              accessibilityLabel={t('Global.Continue')}
              testID={testIdWithKey('PushNotificationContinue')}
              onPress={activatePushNotifications}
            ></Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PushNotifications
