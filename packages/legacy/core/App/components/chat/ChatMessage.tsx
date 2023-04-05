import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Bubble, IMessage, Message } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { formatTime } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import Text from '../texts/Text'

export enum Role {
  me = 'me',
  them = 'them',
}

export interface ChatMessageProps {
  messageProps: React.ComponentProps<typeof Message>
}

export interface ExtendedChatMessage extends IMessage {
  renderEvent: () => JSX.Element
  createdAt: Date
  withDetails?: boolean
  onDetails?: () => void
}

const MessageTime: React.FC<{ message: ExtendedChatMessage }> = ({ message }) => {
  const { ChatTheme: theme } = useTheme()
  return (
    <Text style={message.user._id === Role.me ? theme.timeStyleRight : theme.timeStyleLeft}>
      {formatTime(message.createdAt)}
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

export const ChatMessage: React.FC<ChatMessageProps> = ({ messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()

  const message = useMemo(() => messageProps.currentMessage as ExtendedChatMessage, [messageProps])

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
          renderMessageText={() => message.renderEvent()}
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
            accessibilityLabel={t('Chat.OpenItem')}
            testID={testIdWithKey('OpenItem')}
            onPress={() => {
              if (message.onDetails) message.onDetails()
            }}
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
