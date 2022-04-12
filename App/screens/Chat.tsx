import { useAgent, useConnectionById, useBasicMessagesByConnectionId } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'

import { GiftedChat, IMessage } from 'react-native-gifted-chat'

import { ContactStackParams, Screens } from '../types/navigators'
import InfoIcon from '../components/misc/InfoIcon'

import { renderBubble, renderInputToolbar, renderComposer, renderSend } from '../components/chat'

type ChatProps = StackScreenProps<ContactStackParams, Screens.Chat>

const Chat: React.FC<ChatProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const connectionId = route?.params?.connectionId
  const connection = useConnectionById(route?.params?.connectionId)
  const basicMessages = useBasicMessagesByConnectionId(route?.params?.connectionId)

  const [messages, setMessages] = useState<any>({})

  useEffect(() => {
    navigation.setOptions({
      title: connection?.alias || connection?.invitation?.label,
      headerTitleAlign: 'center',
      headerRight: () => <InfoIcon connectionId={connection?.id} />,
      headerBackTitle: ' ',
    })
  }, [connection])

  useEffect(() => {
    const transformedMessages = basicMessages.map((m) => {
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

  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={true}
      renderAvatar={() => null}
      renderBubble={(props) => renderBubble(props)}
      renderInputToolbar={renderInputToolbar}
      renderSend={renderSend}
      renderComposer={(props) => renderComposer(props, 'Type Message Here')}
      onSend={onSend}
      user={{
        _id: 'sender',
      }}
    />
  )
}

export default Chat
