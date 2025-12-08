// hooks/useCredentialErrorsFromRegistry.ts
import { useEffect, useMemo, useState } from 'react'
import { credentialRegistry, RegistryStore } from '../refresh/registry'
import { getRefreshCredentialMetadata } from '../metadata'
import { RefreshStatus } from '../refresh/types'
import { CredentialErrors, GenericCredentialExchangeRecord } from '../../../types/credentials'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

/**
 * Computes the UI error list for a credential by:
 *   1) Checking the in-memory registry (live session truth)
 *   2) Falling back to persisted refresh metadata (after app restart)
 * You can merge with any existing `propErrors` provided by the caller.
 */
export function useCredentialErrorsFromRegistry(
  credential: GenericCredentialExchangeRecord | undefined,
  propErrors?: CredentialErrors[]
) {
  const id = credential?.id
  const [isInvalidByRegistry, setIsInvalidByRegistry] = useState(false)

  // Subscribe to registry changes and keep a boolean for this credential
  useEffect(() => {
    if (!id) return

    // Immediate read
    const s = credentialRegistry.getState()
    setIsInvalidByRegistry(s.expired.includes(id))

    // Subscribe to changes
    const unsub = credentialRegistry.subscribe((next: RegistryStore) => {
      const flagged = next.expired.includes(id)
      setIsInvalidByRegistry(flagged)
    })

    return unsub
  }, [id])

  // Fallback: metadata (covers case after restart when registry is empty)
  const isInvalidByMetadata = useMemo(() => {
    if (
      !(
        credential instanceof W3cCredentialRecord ||
        credential instanceof SdJwtVcRecord ||
        credential instanceof MdocRecord
      )
    ) {
      return
    }
    if (!credential) return false
    const meta = getRefreshCredentialMetadata(credential)
    return meta?.lastCheckResult === RefreshStatus.Invalid
  }, [credential])

  // Merge: propErrors + derived “invalid” → map to existing enum (Revoked)
  const merged = useMemo(() => {
    const base = Array.isArray(propErrors) ? [...propErrors] : []
    const withoutRevoked = base.filter((e) => e !== CredentialErrors.Revoked)
    const shouldMarkInvalid = isInvalidByRegistry || isInvalidByMetadata
    return shouldMarkInvalid ? [...withoutRevoked, CredentialErrors.Revoked] : withoutRevoked
  }, [propErrors, isInvalidByRegistry, isInvalidByMetadata])

  return merged
}
