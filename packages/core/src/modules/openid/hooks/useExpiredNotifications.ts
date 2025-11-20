// modules/openid/hooks/useExpiredNotifications.ts
import { useEffect, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registery'
import { CustomNotification } from '../../../types/notification'
import { OpenIDCustomNotificationType } from '../refresh/types'

export const useExpiredNotifications = (): CustomNotification[] => {
  const [items, setItems] = useState<CustomNotification[]>([])

  const build = (s: RegistryStore): CustomNotification[] =>
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
        onCloseAction: () => {},
        component: () => null,
        metadata: {
          oldId,
          format: lite?.format,
        },
      }
      return n
    })

  useEffect(() => {
    setItems(build(credentialRegistry.getState()))
    const unsub = credentialRegistry.subscribe((s) => setItems(build(s)))
    return unsub
  }, [])

  return items
}
