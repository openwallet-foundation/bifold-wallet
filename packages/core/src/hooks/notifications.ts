import {
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  W3cV2CredentialRecord,
} from '@credo-ts/core'
import { useBasicMessages, useCredentialByState, useProofByState } from '@bifold/react-hooks'
import {
  DidCommBasicMessageRecord,
  DidCommCredentialExchangeRecord as CredentialRecord,
  DidCommCredentialState,
  DidCommProofExchangeRecord,
  DidCommProofState,
} from '@credo-ts/didcomm'
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
  | DidCommBasicMessageRecord
  | CredentialRecord
  | DidCommProofExchangeRecord
  | CustomNotification
  | SdJwtVcRecord
  | W3cCredentialRecord
  | W3cV2CredentialRecord
  | MdocRecord
  | OpenId4VPRequestRecord

export type NotificationReturnType = Array<NotificationItemType>

export const useNotifications = ({
  openIDUri,
  openIDPresentationUri,
}: NotificationsInputProps): NotificationReturnType => {
  const doneStates = useMemo(() => [DidCommProofState.Done, DidCommProofState.PresentationReceived] as DidCommProofState[], [])

  const [notifications, setNotifications] = useState<NotificationReturnType>([])
  const { records: basicMessages } = useBasicMessages()
  const offers = useCredentialByState(DidCommCredentialState.OfferReceived)
  const proofsRequested = useProofByState(DidCommProofState.RequestReceived)
  const credsReceived = useCredentialByState(DidCommCredentialState.CredentialReceived)
  const credsDone = useCredentialByState(DidCommCredentialState.Done)
  const proofsDone = useProofByState(doneStates)
  const openIDCredRecieved = useOpenID({ openIDUri: openIDUri, openIDPresentationUri: openIDPresentationUri })
  const openIDExpiredNotifs = useExpiredNotifications()
  useEffect(() => {
    // get all unseen messages
    const unseenMessages: DidCommBasicMessageRecord[] = basicMessages.filter((msg) => {
      const meta = msg.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
      return !meta?.seen
    })

    // add one unseen message per contact to notifications
    const contactsWithUnseenMessages: string[] = []
    const messagesToShow: DidCommBasicMessageRecord[] = []

    unseenMessages.forEach((msg) => {
      if (!contactsWithUnseenMessages.includes(msg.connectionId)) {
        contactsWithUnseenMessages.push(msg.connectionId)
        messagesToShow.push(msg)
      }
    })

    const validProofsDone = proofsDone.filter((proof: DidCommProofExchangeRecord) => {
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

    const openIDCreds: Array<SdJwtVcRecord | W3cCredentialRecord | MdocRecord | OpenId4VPRequestRecord | W3cV2CredentialRecord> = []
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
