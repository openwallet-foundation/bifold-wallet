// modules/openid/ui/useReplacementNotifications.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { credentialRegistry, RegistryStore, OpenIDCredentialLite } from '../refresh/registery'
import { CustomNotification } from '../../../types/notification'
import { OpenIDCustomNotificationType } from '../refresh/types'
import { useDeclineReplacement } from './useDeclineReplacement'
import { TOKENS, useServices } from '../../../container-api'

/**
 * A hook that returns a list of CustomNotifications for credentials that have replacements available
 */

export const useReplacementNotifications = (): CustomNotification[] => {
  const [items, setItems] = useState<CustomNotification[]>([])
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const { declineByOldId } = useDeclineReplacement({ logger })

  // Keep first-seen timestamps stable per (oldId -> replId)
  const firstSeenRef = useRef<Record<string, string>>({})

  const build = useCallback(
    (s: Pick<RegistryStore, 'expired' | 'replacements'>): CustomNotification[] => {
      const out: CustomNotification[] = []

      for (const oldId of s.expired) {
        const repl = s.replacements[oldId] as OpenIDCredentialLite | undefined
        if (!repl) continue

        const key = `${oldId}::${repl.id}`
        if (!firstSeenRef.current[key]) firstSeenRef.current[key] = new Date().toISOString()

        out.push({
          type: OpenIDCustomNotificationType.CredentialReplacementAvailable,
          title: 'Credential update available',
          pageTitle: 'Credential Update',
          buttonTitle: 'Review update',
          description: 'A newer version of this credential is ready to accept.',
          createdAt: new Date(firstSeenRef.current[key]),
          onPressAction: () => {}, // your list item handles navigation
          onCloseAction: () => declineByOldId(oldId),
          component: () => null, // keeps renderer happy
          metadata: { oldId, replacementId: repl.id },
        })
      }

      // Newest first for consistent UI
      out.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      return out
    },
    [declineByOldId]
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
