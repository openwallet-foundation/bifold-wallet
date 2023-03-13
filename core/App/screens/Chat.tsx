import {
  BasicMessageRecord,
  CredentialExchangeRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { BasicMessageRole } from '@aries-framework/core/build/modules/basic-messages/BasicMessageRole'
import { useAgent, useBasicMessagesByConnectionId, useConnectionById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'

import { renderComposer, renderInputToolbar, renderSend } from '../components/chat'
import { renderActions } from '../components/chat/ChatActions'
import { ChatEvent } from '../components/chat/ChatEvent'
import { ChatMessage, IChatMessage, Role } from '../components/chat/ChatMessage'
import InfoIcon from '../components/misc/InfoIcon'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useCredentialsByConnectionId } from '../hooks/credentials'
import { useProofsByConnectionId } from '../hooks/proofs'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat>

const getUserLabel = (role: Role, theirLabel: string) => {
  return role === Role.me ? 'Chat.UserYou' : theirLabel
}

const getCredentialEventRole = (record: CredentialExchangeRecord) => {
  switch (record.state) {
    // assuming only Holder states are supported here
    case CredentialState.ProposalSent:
      return Role.me
    case CredentialState.OfferReceived:
      return Role.their
    case CredentialState.RequestSent:
      return Role.me
    case CredentialState.Declined:
      return Role.me
    case CredentialState.CredentialReceived:
      return Role.me
    case CredentialState.Done:
      return Role.me
    default:
      return Role.me
  }
}

const getCredentialEventLabel = (record: CredentialExchangeRecord) => {
  switch (record.state) {
    // assuming only Holder states are supported here
    case CredentialState.ProposalSent:
      return 'Chat.CredentialProposalSent'
    case CredentialState.OfferReceived:
      return 'Chat.CredentialOfferReceived'
    case CredentialState.RequestSent:
      return 'Chat.CredentialRequestSent'
    case CredentialState.Declined:
      return 'Chat.CredentialDeclined'
    case CredentialState.CredentialReceived:
    case CredentialState.Done:
      return 'Chat.CredentialReceived'
    default:
      return ''
  }
}

const getProofEventRole = (record: ProofExchangeRecord) => {
  switch (record.state) {
    case ProofState.RequestSent:
      return Role.me
    case ProofState.ProposalReceived:
      return Role.me
    case ProofState.PresentationReceived:
      return Role.their
    case ProofState.RequestReceived:
      return Role.me
    case ProofState.ProposalSent:
    case ProofState.PresentationSent:
      return Role.me
    case ProofState.Declined:
      return Role.me
    case ProofState.Done:
      return record.isVerified !== undefined ? Role.their : Role.me
    default:
      return Role.me
  }
}

const getProofEventLabel = (record: ProofExchangeRecord) => {
  switch (record.state) {
    case ProofState.RequestSent:
    case ProofState.ProposalReceived:
      return 'Chat.ProofRequestSent'
    case ProofState.PresentationReceived:
      return 'Chat.ProofPresentationReceived'
    case ProofState.RequestReceived:
      return 'Chat.ProofRequestReceived'
    case ProofState.ProposalSent:
    case ProofState.PresentationSent:
      return 'Chat.ProofRequestSatisfied'
    case ProofState.Declined:
      return 'Chat.ProofRequestRejected'
    case ProofState.Done:
      return record.isVerified !== undefined ? 'Chat.ProofPresentationReceived' : 'Chat.ProofRequestSatisfied'
    default:
      return ''
  }
}

const getMessageEventRole = (record: BasicMessageRecord) => {
  return record.role === BasicMessageRole.Sender ? Role.me : Role.their
}

const Chat: React.FC<ChatProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('Chat route prams were not set properly')
  }

  const { connectionId } = route.params
  const [store] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()

  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const credentials = useCredentialsByConnectionId(connectionId)
  const proofs = useProofsByConnectionId(connectionId)

  const theirLabel = useMemo(() => connection?.theirLabel || connection?.id || '', [connection])

  const { assertConnectedNetwork, silentAssertConnectedNetwork } = useNetwork()

  const [messages, setMessages] = useState<Array<IChatMessage>>([])

  const { ChatTheme: theme } = useTheme()

  useMemo(() => {
    assertConnectedNetwork()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      title: theirLabel,
      headerTitleAlign: 'center',
      headerRight: () => <InfoIcon connectionId={connection?.id} />,
    })
  }, [connection])

  useEffect(() => {
    const transformedMessages: Array<IChatMessage> = basicMessages.map((record: BasicMessageRecord) => {
      const role = getMessageEventRole(record)
      return {
        _id: record.id,
        text: record.content,
        renderText: () => <ChatEvent actionLabel={record.content} />,
        record: record,
        createdAt: record.updatedAt || record.createdAt,
        type: record.type,
        user: { _id: role },
      }
    })

    transformedMessages.push(
      ...credentials.map((record: CredentialExchangeRecord) => {
        const role = getCredentialEventRole(record)
        const userLabel = getUserLabel(role, theirLabel)
        const actionLabel = getCredentialEventLabel(record)
        return {
          _id: record.id,
          text: actionLabel,
          renderText: () => <ChatEvent userLabel={userLabel} actionLabel={actionLabel} />,
          record: record,
          createdAt: record.updatedAt || record.createdAt,
          type: record.type,
          user: { _id: role },
          withDetails: record.state === CredentialState.Done,
        }
      })
    )

    transformedMessages.push(
      ...proofs.map((record: ProofExchangeRecord) => {
        const role = getProofEventRole(record)
        const userLabel = getUserLabel(role, theirLabel)
        const actionLabel = getProofEventLabel(record)
        return {
          _id: record.id,
          text: actionLabel,
          renderText: () => <ChatEvent userLabel={userLabel} actionLabel={actionLabel} />,
          record: record,
          createdAt: record.updatedAt || record.createdAt,
          type: record.type,
          user: { _id: role },
          withDetails:
            (record.state === ProofState.Done || record.state === ProofState.PresentationReceived) &&
            record.isVerified !== undefined,
        }
      })
    )
    setMessages(transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt))
  }, [basicMessages, credentials, proofs])

  const onSend = useCallback(
    async (messages: IMessage[]) => {
      await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
    },
    [agent, connectionId]
  )

  const onSendRequest = useCallback(async () => {
    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
      screen: Screens.ProofRequests,
      params: { navigation: navigation, connectionId },
    })
  }, [navigation, connectionId])

  const actions = useMemo(() => {
    return store.preferences.useVerifierCapability
      ? {
          [t('Verifier.SendProofRequest')]: () => onSendRequest(),
        }
      : undefined
  }, [t, store.preferences.useVerifierCapability, onSendRequest])

  const onEventDetails = useCallback(
    (message: IChatMessage) => {
      if (message.record instanceof CredentialExchangeRecord) {
        navigation.getParent()?.navigate(Stacks.ContactStack, {
          screen: Screens.CredentialDetails,
          params: { credentialId: message.record.id },
        })
      } else if (message.record instanceof ProofExchangeRecord) {
        navigation.getParent()?.navigate(Stacks.ContactStack, {
          screen: Screens.ProofDetails,
          params: { recordId: message.record.id, isHistory: true },
        })
      }
    },
    [navigation]
  )

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      renderAvatar={() => null}
      renderMessage={(props) => <ChatMessage messageProps={props} onActionButtonTap={onEventDetails} />}
      renderInputToolbar={(props) => renderInputToolbar(props, theme)}
      renderSend={(props) => renderSend(props, theme)}
      renderComposer={(props) => renderComposer(props, theme, t('Contacts.TypeHere'))}
      disableComposer={!silentAssertConnectedNetwork()}
      onSend={onSend}
      user={{
        _id: Role.me,
      }}
      renderActions={(props) => renderActions(props, theme, actions)}
    />
  )
}

export default Chat
