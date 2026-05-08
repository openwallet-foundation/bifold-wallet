// modules/openid/hooks/useExpiredNotifications.ts
import { useCallback, useEffect, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registry'
import { CustomNotification } from '../../../types/notification'
import { OpenIDCustomNotificationType } from '../refresh/types'
import { TOKENS, useServices } from '../../../container-api'
import { useDeclineReplacement } from './useDeclineReplacement'
import { getOpenIDCredentialById } from '../credentialRecord'
import { useAgent } from '@bifold/react-hooks'
import { OpenIDCredentialType } from '../types'

export const useExpiredNotifications = (): CustomNotification[] => {
  const [items, setItems] = useState<CustomNotification[]>([])
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const { declineByOldId } = useDeclineReplacement({ logger })
  const { agent } = useAgent()

  const build = useCallback(
    async (s: RegistryStore): Promise<CustomNotification[]> => {
      const expiredCredentialNotification = s.expired
        .filter((oldId) => s.checked.includes(oldId) && !s.replacements[oldId])
        .map((oldId) => {
          let credential; 
          getOpenIDCredentialById(agent, OpenIDCredentialType.SdJwtVc, oldId)
            .then((cred) => {
              console.log(cred)
            })
          const lite = s.byId[oldId]
          const notification: CustomNotification = {
            type: OpenIDCustomNotificationType.CredentialExpired,
            createdAt: new Date(),
            onPressAction: () => {},
            onCloseAction: () => declineByOldId(oldId),
            metadata: {
              oldId,
              format: lite?.format,
              credential,
            },
          }
          return notification
        })
      return expiredCredentialNotification
    },
    [declineByOldId]
  )

  useEffect(() => {
    build(credentialRegistry.getState()).then((result) => {
      setItems(result)
    })
    const unsub = credentialRegistry.subscribe((s) => {
      build(s).then((result) => {
        setItems(result)
      })
    })
    return unsub
  }, [build])

  return items
}
