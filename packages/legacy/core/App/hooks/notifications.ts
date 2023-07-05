import {
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'

import { CredentialMetadata, customMetadata } from '../types/metadata'

interface Notifications {
  total: number
  notifications: Array<CredentialRecord | ProofExchangeRecord>
}

export const useNotifications = (): Notifications => {
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofsRequested = useProofByState(ProofState.RequestReceived)
  const revoked = useCredentialByState(CredentialState.Done).filter((cred: CredentialRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const metadata = cred!.metadata.get(CredentialMetadata.customMetadata) as customMetadata
    if (cred?.revocationNotification && metadata?.revoked_seen == undefined) {
      return cred
    }
  })

  const notifications = [...offers, ...proofsRequested, ...revoked].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return { total: notifications.length, notifications }
}
