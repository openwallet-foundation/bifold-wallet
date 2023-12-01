import {
  BasicMessageRecord,
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { useBasicMessages, useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import { ProofCustomMetadata, ProofMetadata } from '@hyperledger/aries-bifold-verifier'

import {
  BasicMessageMetadata,
  CredentialMetadata,
  basicMessageCustomMetadata,
  credentialCustomMetadata,
} from '../types/metadata'

interface Notifications {
  total: number
  notifications: Array<BasicMessageRecord | CredentialRecord | ProofExchangeRecord>
}

export const useNotifications = (): Notifications => {
  const { records: basicMessages } = useBasicMessages()
  // get all unseen messages
  const unseenMessages: BasicMessageRecord[] = basicMessages.filter((msg) => {
    const meta = msg.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
    return !meta?.seen
  })
  // add one unseen message per contact to notifications
  const contactsWithUnseenMessages: string[] = []
  const messagesToShow: BasicMessageRecord[] = []
  unseenMessages.forEach((msg) => {
    if (!contactsWithUnseenMessages.includes(msg.connectionId)) {
      contactsWithUnseenMessages.push(msg.connectionId)
      messagesToShow.push(msg)
    }
  })
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofsRequested = useProofByState(ProofState.RequestReceived)
  const proofsDone = useProofByState([ProofState.Done, ProofState.PresentationReceived]).filter(
    (proof: ProofExchangeRecord) => {
      if (proof.isVerified === undefined) return false
      const metadata = proof.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
      return !metadata?.details_seen
    }
  )
  const revoked = useCredentialByState(CredentialState.Done).filter((cred: CredentialRecord) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const metadata = cred!.metadata.get(CredentialMetadata.customMetadata) as credentialCustomMetadata
    if (cred?.revocationNotification && metadata?.revoked_seen == undefined) {
      return cred
    }
  })

  const notifications = [...messagesToShow, ...offers, ...proofsRequested, ...proofsDone, ...revoked].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return { total: notifications.length, notifications }
}
