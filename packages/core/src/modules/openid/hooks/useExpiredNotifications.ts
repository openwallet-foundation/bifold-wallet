// modules/openid/hooks/useExpiredNotifications.ts
import { useCallback, useEffect, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registery'
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
      s.expired.map((oldId) => {
        const lite = s.byId[oldId]
        const n: CustomNotification = {
          type: OpenIDCustomNotificationType.CredentialExpired,
          title: 'Credential expired',
          pageTitle: 'Credential Expired',
          buttonTitle: 'Review',
          description: 'This credential is no longer valid. You can attempt to obtain an updated version.',
          createdAt: new Date(),
          onPressAction: () => {},
          onCloseAction: () => declineByOldId(oldId),
          component: () => null,
          metadata: {
            oldId,
            format: lite?.format,
          },
        }
        return n
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
