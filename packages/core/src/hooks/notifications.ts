import {
  BasicMessageRecord,
  CredentialExchangeRecord as CredentialRecord,
  CredentialState,
  MdocRecord,
  ProofExchangeRecord,
  ProofState,
  SdJwtVcRecord,
  W3cCredentialRecord,
} from '@credo-ts/core'
import { useBasicMessages, useCredentialByState, useProofByState } from '@bifold/react-hooks'
import { ProofCustomMetadata, ProofMetadata } from '@bifold/verifier'
import { useEffect, useMemo, useState } from 'react'

import {
  BasicMessageMetadata,
  CredentialMetadata,
  basicMessageCustomMetadata,
  credentialCustomMetadata,
} from '../types/metadata'
import { useOpenID } from '../modules/openid/hooks/openid'
import { CustomNotification } from '../types/notification'
import { OpenId4VPRequestRecord } from '../modules/openid/types'
import { useExpiredNotifications } from '../modules/openid/hooks/useExpiredNotifications'

export type NotificationsInputProps = {
  openIDUri?: string
  openIDPresentationUri?: string
}

export type NotificationItemType =
  | BasicMessageRecord
  | CredentialRecord
  | ProofExchangeRecord
  | CustomNotification
  | SdJwtVcRecord
  | W3cCredentialRecord
  | MdocRecord
  | OpenId4VPRequestRecord

export type NotificationReturnType = Array<NotificationItemType>

export const useNotifications = ({
  openIDUri,
  openIDPresentationUri,
}: NotificationsInputProps): NotificationReturnType => {
  const doneStates = useMemo(() => [ProofState.Done, ProofState.PresentationReceived] as ProofState[], [])

  const [notifications, setNotifications] = useState<NotificationReturnType>([])
  const { records: basicMessages } = useBasicMessages()
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofsRequested = useProofByState(ProofState.RequestReceived)
  const credsReceived = useCredentialByState(CredentialState.CredentialReceived)
  const credsDone = useCredentialByState(CredentialState.Done)
  const proofsDone = useProofByState(doneStates)
  const openIDCredRecieved = useOpenID({ openIDUri: openIDUri, openIDPresentationUri: openIDPresentationUri })
  const openIDExpiredNotifs = useExpiredNotifications()
  useEffect(() => {
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

    const validProofsDone = proofsDone.filter((proof: ProofExchangeRecord) => {
      if (proof.isVerified === undefined) {
        return false
      }

      const metadata = proof.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata

      return !metadata?.details_seen
    })

    const revoked = credsDone.filter((cred: CredentialRecord) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const metadata = cred!.metadata.get(CredentialMetadata.customMetadata) as credentialCustomMetadata
      if (cred?.revocationNotification && metadata?.revoked_seen == undefined) {
        return cred
      }
    })

    const openIDCreds: Array<SdJwtVcRecord | W3cCredentialRecord | MdocRecord | OpenId4VPRequestRecord> = []
    if (openIDCredRecieved) {
      openIDCreds.push(openIDCredRecieved)
    }

    const notif = [
      ...messagesToShow,
      ...offers,
      ...proofsRequested,
      ...validProofsDone,
      ...revoked,
      ...openIDCreds,
      ...openIDExpiredNotifs,
    ].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

    setNotifications(notif)
  }, [
    basicMessages,
    credsReceived,
    proofsDone,
    proofsRequested,
    offers,
    credsDone,
    openIDCredRecieved,
    openIDExpiredNotifs,
  ])

  return notifications
}
