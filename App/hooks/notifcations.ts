import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'

export function useNotifications() {
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)

  const notifications = [...offers, ...proofs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return { total: notifications.length, notifications }
}
