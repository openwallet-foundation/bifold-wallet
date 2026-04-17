import { useCallback } from 'react'
import { TOKENS, useServices } from '../../../container-api'
import { useAppAgent } from '../../../utils/agent'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { credentialRegistry, selectOldIdByReplacementId } from '../refresh/registry'
import {
  deleteOpenIDCredential,
  findOpenIDCredentialById,
  OpenIDCredentialRecord,
  storeOpenIDCredential,
} from '../credentialRecord'
/**
 * A hook that provides functions to accept newly issued credentials, handling replacements if applicable.
 */

export function useAcceptReplacement() {
  const { getCredentialById } = useOpenIDCredentials()
  const { agent } = useAppAgent()
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  /**
   * Accept a newly issued credential:
   * 1) store it
   * 2) if it replaces an old one (per registry), fetch old via provider & delete it
   * 3) update the registry (acceptReplacement)
   */
  const acceptNewCredential = useCallback(
    async (newCred: OpenIDCredentialRecord) => {
      if (!agent) {
        throw new Error('Agent not ready')
      }

      logger.info(`🟢 [useAcceptReplacement] accepting new credential → ${newCred.id}`)

      // 1) persist new
      await storeOpenIDCredential(agent, newCred)

      // 2) check if it replaces an old credential
      const oldId = selectOldIdByReplacementId(newCred.id)
      if (!oldId) {
        logger.info(`ℹ️ [useAcceptReplacement] no replacement mapping for ${newCred.id} — done`)
        return
      }

      // 3) fetch old record across OpenID credential stores
      const oldRecord = await findOpenIDCredentialById(agent, oldId)

      if (!oldRecord) {
        logger.warn(`⚠️ [useAcceptReplacement] old record ${oldId} not found — skipping delete`)
        // still accept swap in registry to avoid stuck state
        credentialRegistry.getState().acceptReplacement(oldId)
        return
      }

      // 4) delete old
      await deleteOpenIDCredential(agent, oldRecord)

      // 5) finalize the swap in registry
      credentialRegistry.getState().acceptReplacement(oldId)

      logger.info(`✅ [useAcceptReplacement] replacement complete: old=${oldId} → new=${newCred.id}`)
    },
    [agent, logger]
  )

  /**
   * Convenience: accept by new credential id (fetch via provider first).
   * Useful if your screen only carries the new id.
   */
  const acceptById = useCallback(
    async (newId: string) => {
      const rec = await getCredentialById(newId)
      if (!rec) throw new Error(`New credential not found for id=${newId}`)
      await acceptNewCredential(rec)
    },
    [getCredentialById, acceptNewCredential]
  )

  return { acceptNewCredential, acceptById }
}
