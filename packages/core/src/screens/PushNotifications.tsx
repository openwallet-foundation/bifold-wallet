import React from 'react'
import { useTranslation } from 'react-i18next'

import Button, { ButtonType } from '../components/buttons/Button'
import PushNotificationsContent from '../components/views/PushNotificationsContent'
import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { testIdWithKey } from '../utils/testable'
import ScreenWrapper from '../components/views/ScreenWrapper'

// Screen to show during onboarding that prompts
// for push notification permissions
const PushNotifications: React.FC = () => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [{ enablePushNotifications }] = useServices([TOKENS.CONFIG])

  if (!enablePushNotifications) {
    throw new Error('Push notification configuration not found')
  }

  const activatePushNotifications = async () => {
    const state = await enablePushNotifications.setup()
    dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [state === 'granted'] })
  }

  const controls = (
    <Button
      buttonType={ButtonType.Primary}
      title={t('Global.Continue')}
      accessibilityLabel={t('Global.Continue')}
      testID={testIdWithKey('PushNotificationContinue')}
      onPress={activatePushNotifications}
    />
  )

  return (
    <ScreenWrapper controls={controls}>
      <PushNotificationsContent />
    </ScreenWrapper>
  )
}

export default PushNotifications
