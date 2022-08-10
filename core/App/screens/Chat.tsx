import { useAgent, useConnectionById, useBasicMessagesByConnectionId } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect, useMemo } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'

import { renderBubble, renderInputToolbar, renderComposer, renderSend } from '../components/chat'
import InfoIcon from '../components/misc/InfoIcon'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens } from '../types/navigators'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat>

const Chat: React.FC<ChatProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('Chat route prams were not set properly')
  }

  const { connectionId } = route.params

  const { agent } = useAgent()
  const connection = useConnectionById(connectionId)
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
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
    setMessages(transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt))
  }, [basicMessages])

  const onSend = async (messages: IMessage[]) => {
    await agent?.basicMessages.sendMessage(connectionId, messages[0].text)
  }

  const { ChatTheme: theme } = useTheme()

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      renderAvatar={() => null}
      renderBubble={(props) => renderBubble(props, theme)}
      renderInputToolbar={(props) => renderInputToolbar(props, theme)}
      renderSend={(props) => renderSend(props, theme)}
      renderComposer={(props) => renderComposer(props, theme, 'Type Message Here')}
      disableComposer={!silentAssertConnectedNetwork()}
      onSend={onSend}
      user={{
        _id: 'sender',
      }}
    />
  )
}

export default Chat
