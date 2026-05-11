// modules/openid/hooks/useExpiredNotifications.ts
import { useCallback, useEffect, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registry'
import { CustomNotification } from '../../../types/notification'
import { OpenIDCustomNotificationType } from '../refresh/types'
import { TOKENS, useServices } from '../../../container-api'
import { useDeclineReplacement } from './useDeclineReplacement'

export const useExpiredNotifications = (): CustomNotification[] => {
  const [items, setItems] = useState<CustomNotification[]>([])
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const { declineByOldId } = useDeclineReplacement({ logger })

  const build = useCallback(
    (s: RegistryStore): CustomNotification[] =>
      s.expired
        .filter((oldId) => s.checked.includes(oldId) && !s.replacements[oldId] && !s.notificationRemoved.includes(oldId))
        .map((oldId) => {
          const notification: CustomNotification = {
            type: OpenIDCustomNotificationType.CredentialExpired,
            createdAt: new Date(),
            onPressAction: () => {},
            onCloseAction: () => { s.markNotificationRemoved(oldId) },
            metadata: { oldId },
          }
          return notification
        }),
    [declineByOldId]
  )

  useEffect(() => {
    setItems(build(credentialRegistry.getState()))
    const unsub = credentialRegistry.subscribe((s) => setItems(build(s)))
    return unsub
  }, [build])

  return items
}
