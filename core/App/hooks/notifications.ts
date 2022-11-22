import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofRecord,
  ProofState,
} from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { CredentialMetadata, customMetadata } from '../types/metadata'

interface Notifications {
  total: number
  notifications: Array<CredentialRecord | ProofRecord>
}

export const useNotifications = (): Notifications => {
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const revoked = useCredentialByState(CredentialState.Done).filter((cred: CredentialRecord) => {
    let metadata = cred!.metadata.get(CredentialMetadata.customMetadata) as customMetadata
    return metadata.revoked_seen
  })

  const notifications = [...offers, ...proofs, ...revoked,].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return { total: notifications.length, notifications }
}
