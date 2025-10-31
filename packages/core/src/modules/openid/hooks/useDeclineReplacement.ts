// modules/openid/hooks/useDeclineReplacement.ts
import { useCallback } from 'react'
import { credentialRegistry } from '../refresh/registery'
import type { BifoldLogger } from '../../../services/logger'
import type { CustomNotification } from '../../../types/notification'

type Options = {
  logger?: BifoldLogger
}

function findOldIdByNewId(newId: string): string | undefined {
  const s = credentialRegistry.getState()
  // replacements: { [oldId]: { id: newId, ... } }
  for (const [oldId, lite] of Object.entries(s.replacements)) {
    if (lite?.id === newId) return oldId
  }
  return undefined
}

/**
 * Decline a replacement offer: clears the registry entry so the notification disappears.
 * No repo operations (no save/delete) are performed.
 */
export function useDeclineReplacement(opts: Options = {}) {
  const { logger } = opts

  /**
   * Decline by OLD credential id (kept for callers that know oldId)
   */
  const declineByOldId = useCallback(
    async (oldId: string) => {
      credentialRegistry.setState((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [oldId]: _drop, ...restRepl } = prev.replacements
        return {
          ...prev,
          expired: prev.expired.filter((x) => x !== oldId),
          replacements: restRepl,
          refreshing: Object.fromEntries(Object.entries(prev.refreshing).filter(([k]) => k !== oldId)),
        }
      })
      logger?.info(`🧹 [Decline] Cleared replacement notification for oldId=${oldId}`)
    },
    [logger]
  )

  /**
   * Decline by NEW credential id (use this from the Offer screen where you only know newId)
   */
  const declineByNewId = useCallback(
    async (newId: string) => {
      const oldId = findOldIdByNewId(newId)
      if (!oldId) {
        logger?.warn(`🧹 [Decline] No matching oldId found for newId=${newId}`)
        return
      }
      await declineByOldId(oldId)
    },
    [declineByOldId, logger]
  )

  /**
   * Helper: decline directly from a CustomNotification object
   */
  const declineFromNotification = useCallback(
    async (notif: CustomNotification) => {
      const oldId = notif?.metadata?.oldId as string | undefined
      if (oldId) {
        await declineByOldId(oldId)
        return
      }
      const newId = notif?.metadata?.replacementId as string | undefined
      if (newId) {
        await declineByNewId(newId)
        return
      }
      logger?.warn(`🧹 [Decline] Missing oldId/newId in notification.metadata`)
    },
    [declineByOldId, declineByNewId, logger]
  )

  return { declineByOldId, declineByNewId, declineFromNotification }
}
