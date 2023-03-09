import {CredentialExchangeRecord, CredentialState, ProofExchangeRecord, ProofState} from '@aries-framework/core'
import {
  useAgent,
  useConnectionById,
  useBasicMessagesByConnectionId,
  useCredentials, useProofs,
} from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'

import { renderInputToolbar, renderComposer, renderSend } from '../components/chat'
import { renderActions } from '../components/chat/ChatActions'
import { ChatMessage } from '../components/chat/ChatMessage'
import InfoIcon from '../components/misc/InfoIcon'
import Text from '../components/texts/Text'
import { useNetwork } from '../contexts/network'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'
import {useNavigation} from "@react-navigation/core";

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat>

const Chat: React.FC<ChatProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('Chat route prams were not set properly')
  }

  const useCredentialsByConnectionId = (connectionId: string): CredentialExchangeRecord[] => {
    const { records: credentials } = useCredentials()
    return useMemo(
      () => credentials.filter((credential: CredentialExchangeRecord) => credential.connectionId === connectionId),
      [credentials, connectionId]
    )
  }

  const useProofsByConnectionId = (connectionId: string): ProofExchangeRecord[] => {
    const { records: proofs } = useProofs()
    return useMemo(
      () => proofs.filter((proof: ProofExchangeRecord) => proof.connectionId === connectionId),
      [proofs, connectionId]
    )
  }

  const { connectionId } = route.params
  const [store] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const credentials = useCredentialsByConnectionId(connectionId)
  const proofs = useProofsByConnectionId(connectionId)
  const { assertConnectedNetwork, silentAssertConnectedNetwork } = useNetwork()

  const [messages, setMessages] = useState<any>([])

  const { ChatTheme: theme } = useTheme()

  useMemo(() => {
    assertConnectedNetwork()
  }, [])

  useEffect(() => {
    navigation.setOptions({
      title: connection?.theirLabel || connection?.id || '',
      headerTitleAlign: 'center',
      headerRight: () => <InfoIcon connectionId={connection?.id} />,
    })
  }, [connection])

  const getProofTextUser = useCallback(
    (record) => {
      return t('Chat.UserYou')
    },
    [t]
  )

  const getProofTextAction = useCallback(
    (record) => {
      switch (record.state) {
        case ProofState.RequestSent:
        case ProofState.ProposalReceived:
          return t('Chat.ProofRequestSent')
        case ProofState.PresentationReceived:
          return t('Chat.ProofPresentationReceived')
        case ProofState.RequestReceived:
          return record.role === 'sender' ? t('Chat.ProofRequestSent') : t('Chat.ProofRequestReceived')
        case ProofState.ProposalSent:
        case ProofState.PresentationSent:
          return t('Chat.ProofRequestSatisfied')
        case ProofState.Declined:
          return t('Chat.ProofRequestRejected')
        case ProofState.Done:
          return record.role === 'sender' ? t('Chat.ProofPresentationReceived') : t('Chat.ProofRequestSatisfied')
        default:
          return ''
      }
    },
    [t]
  )

  const getProofText = useCallback(
    (record: any) => {
      const userName = getProofTextUser(record)
      const action = getProofTextAction(record)

      if (action.length === 0) return ''

      return `${userName} ${action}`
    },
    [getProofTextUser, getProofTextAction]
  )

  const getProofTextView = useCallback(
    (record: any) => {
      return (
        <Text style={theme.leftText}>
          {getProofTextUser(record)} <Text style={theme.leftTextHighlighted}>{getProofTextAction(record)}</Text>
        </Text>
      )
    },
    [theme, getProofTextAction, getProofTextUser]
  )

  const getCredentialTextUser = useCallback(
    (record) => {
      return t('Chat.UserYou')
    },
    [t]
  )

  const getCredentialTextAction = useCallback(
    (record) => {
      switch (record.state) {
        // assuming only Holder states are supported here
        case CredentialState.ProposalSent:
          return t('Chat.CredentialProposalSent')
        case CredentialState.OfferReceived:
          return t('Chat.CredentialOfferReceived')
        case CredentialState.RequestSent:
          return t('Chat.CredentialRequestSent')
        case CredentialState.Declined:
          return t('Chat.CredentialDeclined')
        case CredentialState.CredentialReceived:
        case CredentialState.Done:
          return t('Chat.CredentialReceived')
        default:
          return ''
      }
    },
    [t]
  )

  const getCredentialText = useCallback(
    (record: any) => {
      const userName = getCredentialTextUser(record)
      const action = getCredentialTextAction(record)

      if (action.length === 0) return ''

      return `${userName} ${action}`
    },
    [getCredentialTextUser, getCredentialTextAction]
  )

  const getCredentialTextView = useCallback(
    (record: any) => {
      return (
        <Text style={theme.leftText}>
          {getCredentialTextUser(record)}{' '}
          <Text style={theme.leftTextHighlighted}>{getCredentialTextAction(record)}</Text>
        </Text>
      )
    },
    [theme, getCredentialTextAction, getCredentialTextUser]
  )

  useEffect(() => {
    const transformedMessages = basicMessages.map((m: any) => {
      return {
        _id: m.id,
        text: m.content,
        renderText: () => <Text style={theme.leftText}>{m.content}</Text>,
        record: m,
        createdAt: m.createdAt,
        type: m.type,
        user: { _id: m.role },
      }
    })

    transformedMessages.push(
      ...credentials.map((cred: any) => {
        return {
          _id: cred.id,
          text: getCredentialText(cred),
          renderText: () => getCredentialTextView(cred),
          record: cred,
          createdAt: cred.createdAt,
          type: cred.type,
          user: { _id: 'receiver' },
        }
      })
    )

    transformedMessages.push(
      ...proofs.map((proof: any) => {
        return {
          _id: proof.id,
          text: getProofText(proof),
          renderText: () => getProofTextView(proof),
          record: proof,
          createdAt: proof.createdAt,
          type: proof.type,
          user: { _id: 'receiver' },
        }
      })
    )
    setMessages(transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt))
  }, [basicMessages, credentials])

  const onSend = async (messages: IMessage[]) => {
    await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
  }

  const onSendRequest = async () => {
    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, {
      screen: Screens.ProofRequests,
      params: { navigation: navigation, connectionId },
    })
  }

  const actions = useMemo(() => {
    return store.preferences.useVerifierCapability
      ? {
          [t('Verifier.SendProofRequest')]: () => onSendRequest(),
        }
      : undefined
  }, [t, onSendRequest])

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      renderAvatar={() => null}
      renderMessage={(props) => (
        <ChatMessage
          messageProps={props}
          onActionButtonTap={(message) => {
            if (message.record instanceof CredentialExchangeRecord) {
              navigation.getParent()?.navigate(Stacks.ContactStack, {
                screen: Screens.CredentialDetails,
                params: { credentialId: message.record.id },
              })
            } else if (message.record instanceof ProofExchangeRecord) {
              navigation.getParent()?.navigate(Stacks.ContactStack, {
                screen: Screens.ProofDetails,
                params: { templateId: message.record.id, connectionId: connectionId },
              })
            }
          }}
        />
      )}
      renderInputToolbar={(props) => renderInputToolbar(props, theme)}
      renderSend={(props) => renderSend(props, theme)}
      renderComposer={(props) => renderComposer(props, theme, t('Contacts.TypeHere'))}
      disableComposer={!silentAssertConnectedNetwork()}
      onSend={onSend}
      user={{
        _id: 'sender',
      }}
      renderActions={(props) => renderActions(props, theme, actions)}
    />
  )
}

export default Chat
