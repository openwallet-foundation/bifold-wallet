// modules/openid/hooks/useExpiredNotifications.ts
import { useCallback, useEffect, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registry'
import { OpenIDCustomNotificationType } from '../refresh/types'
import { TOKENS, useServices } from '../../../container-api'
import { useDeclineReplacement } from './useDeclineReplacement'
import { OpenIDNotificationData } from '../features/notifications/types'

export const useExpiredNotifications = (): OpenIDNotificationData[] => {
  const [items, setItems] = useState<OpenIDNotificationData[]>([])
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const { declineByOldId } = useDeclineReplacement({ logger })

  const build = useCallback(
    (s: RegistryStore): OpenIDNotificationData[] =>
      s.expired
        .filter((oldId) => s.checked.includes(oldId) && !s.replacements[oldId] && !s.notificationRemoved.includes(oldId))
        .map((oldId) => {
          const notification: OpenIDNotificationData = {
            type: OpenIDCustomNotificationType.CredentialExpired,
            createdAt: new Date(),
            onPressAction: () => {},
            onCloseAction: () => { 
              s.markNotificationRemoved(oldId)
              declineByOldId(oldId)
            },
            metadata: { oldId },
          }
          return notification
        }),
    []
  )

  useEffect(() => {
    setItems(build(credentialRegistry.getState()))
    const unsub = credentialRegistry.subscribe((s) => setItems(build(s)))
    return unsub
  }, [build])

  return items
}
