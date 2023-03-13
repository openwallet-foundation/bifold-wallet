import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Bubble, IMessage, Message } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import Text from '../texts/Text'

export enum Role {
  me = 'me',
  their = 'their',
}

export interface ChatMessageProps {
  onActionButtonTap: (message: IChatMessage) => void
  messageProps: React.ComponentProps<typeof Message>
}

export interface IChatMessage extends IMessage {
  renderText: () => JSX.Element
  record: any
  createdAt: Date
  withDetails?: boolean
}

const MessageTime: React.FC<{ message: IChatMessage }> = ({ message }) => {
  const { ChatTheme: theme } = useTheme()
  return (
    <Text style={{ ...theme.timeStyle }}>
      {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(message.createdAt)}
    </Text>
  )
}

const MessageIcon: React.FC = () => {
  const { ChatTheme: theme } = useTheme()
  return (
    <View style={{ ...theme.documentIconContainer }}>
      <Icon name={'file-document-outline'} size={32} color={theme.documentIcon.color} />
    </View>
  )
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ onActionButtonTap, messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()

  const message = useMemo(() => messageProps.currentMessage as IChatMessage, [messageProps])

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: message.user._id === Role.me ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          ...theme.containerStyle,
        }}
      >
        <Bubble
          {...messageProps}
          renderUsernameOnMessage={false}
          renderMessageText={() => message.renderText()}
          containerStyle={{
            left: {
              margin: 0,
            },
            right: {
              margin: 0,
            },
          }}
          wrapperStyle={{
            left: { ...theme.leftBubble, marginRight: 0, marginLeft: 0 },
            right: { ...theme.rightBubble, marginLeft: 0, marginRight: 0 },
          }}
          textStyle={{
            left: { ...theme.leftText },
            right: { ...theme.rightText },
          }}
          renderTime={() => <MessageTime message={message} />}
          renderCustomView={() => (message.withDetails ? <MessageIcon /> : null)}
        />
        {message.withDetails && (
          <TouchableOpacity
            onPress={() => onActionButtonTap(message)}
            style={{
              ...theme.openButtonStyle,
            }}
          >
            <Text style={{ ...theme.openButtonTextStyle }}>{t('Chat.OpenItem')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
