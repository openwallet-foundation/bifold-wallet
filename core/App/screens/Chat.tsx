import {
  useAgent,
  useConnectionById,
  useBasicMessagesByConnectionId,
  useCredentials,
} from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'

import { renderInputToolbar, renderComposer, renderSend } from '../components/chat'
import { ChatMessage } from '../components/chat/ChatMessage'
import InfoIcon from '../components/misc/InfoIcon'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens } from '../types/navigators'
import {CredentialExchangeRecord, CredentialState} from '@aries-framework/core'

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
  const { t } = useTranslation()
  const { agent } = useAgent()
  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const credentials = useCredentialsByConnectionId(connectionId)
  const { assertConnectedNetwork, silentAssertConnectedNetwork } = useNetwork()

  const [messages, setMessages] = useState<any>([])

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

  const getCredentialMessage = (record: any) => {
    switch (record.state) {
      // assuming only Holder states are supported here
      case CredentialState.ProposalSent:
        return 'You sent a credential proposal'
      case CredentialState.OfferReceived:
        return 'You received a credential offer'
      case CredentialState.RequestSent:
        return 'You sent a credential request'
      case CredentialState.Declined:
        return 'You declined a credential offer'
      case CredentialState.CredentialReceived:
      case CredentialState.Done:
        return 'You received a credential'
    }
  }

  useEffect(() => {
    const transformedMessages = basicMessages.map((m: any) => {
      return {
        _id: m.id,
        text: m.content,
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
          text: getCredentialMessage(cred) as any,
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

  const { ChatTheme: theme } = useTheme()

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
    />
  )
}

export default Chat
