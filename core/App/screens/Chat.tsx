import { CredentialExchangeRecord, CredentialState } from '@aries-framework/core'
import {
  useAgent,
  useConnectionById,
  useBasicMessagesByConnectionId,
  useCredentials,
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

  const { connectionId } = route.params
  const [store] = useStore()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const credentials = useCredentialsByConnectionId(connectionId)
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

  const getCredentialText = useCallback(
    (record: any) => {
      switch (record.state) {
        // assuming only Holder states are supported here
        case CredentialState.ProposalSent:
          return (
            <Text style={theme.leftText}>
              You <Text style={theme.leftTextHighlighted}>sent a credential proposal</Text>
            </Text>
          )
        case CredentialState.OfferReceived:
          return <Text>You received a credential offer</Text>
        case CredentialState.RequestSent:
          return <Text>You sent a credential request</Text>
        case CredentialState.Declined:
          return <Text>You declined a credential offer</Text>
        case CredentialState.CredentialReceived:
        case CredentialState.Done:
          return (
            <Text style={theme.leftText}>
              You <Text style={theme.leftTextHighlighted}>received a credential</Text>
            </Text>
          )
        default:
          return <Text> </Text>
      }
    },
    [theme]
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
          text: 'a' as any,
          renderText: () => getCredentialText(cred),
          record: cred,
          createdAt: cred.createdAt,
          type: cred.type,
          user: { _id: 'receiver' as any },
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
            /* open proof request/credential */
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
