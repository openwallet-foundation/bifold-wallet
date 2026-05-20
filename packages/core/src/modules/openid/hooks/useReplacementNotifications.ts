// modules/openid/ui/useReplacementNotifications.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { credentialRegistry, RegistryStore } from '../refresh/registry'
import { OpenIDNotificationData } from '../features/notifications/types'
import { OpenIDCustomNotificationType } from '../refresh/types'
import { useDeclineReplacement } from './useDeclineReplacement'
import { TOKENS, useServices } from '../../../container-api'
import { useOpenIdReplacementNavigation } from './useOpenIdReplacementNavigation'

/**
 * A hook that returns a list of CustomNotifications for credentials that have replacements available
 */

export const useReplacementNotifications = (): OpenIDNotificationData[] => {
  const [items, setItems] = useState<OpenIDNotificationData[]>([])
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const { declineByOldId } = useDeclineReplacement({ logger })
  const openReplacementOffer = useOpenIdReplacementNavigation()

  // Keep first-seen timestamps stable per (oldId -> replId)
  const firstSeenRef = useRef<Record<string, string>>({})

  const build = useCallback(
    (s: Pick<RegistryStore, 'expired' | 'replacements'>): OpenIDNotificationData[] => {
      const out: OpenIDNotificationData[] = []

      for (const oldId of s.expired) {
        const repl = s.replacements[oldId]
        if (!repl) continue

        const key = `${oldId}::${repl.id}`
        if (!firstSeenRef.current[key]) firstSeenRef.current[key] = new Date().toISOString()

        out.push({
          type: OpenIDCustomNotificationType.CredentialReplacementAvailable,
          createdAt: new Date(firstSeenRef.current[key]),
          metadata: { oldId },
          onPressAction: () => { openReplacementOffer(repl.id) },
        })
      }

      // Newest first for consistent UI
      out.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      return out
    },
    [openReplacementOffer]
  )

  useEffect(() => {
    // Initial build
    const s = credentialRegistry.getState()
    setItems(build({ expired: s.expired, replacements: s.replacements }))

    // Subscribe to full state updates (since vanilla store lacks selector arg)
    const unsub = credentialRegistry.subscribe((state) => {
      setItems(build({ expired: state.expired, replacements: state.replacements }))
    })
    

    return unsub
  }, [build])

  return useMemo(() => items, [items])
}
