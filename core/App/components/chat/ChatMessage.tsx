import { BasicMessageRecord, CredentialExchangeRecord, ProofExchangeRecord } from '@aries-framework/core'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Bubble, Message } from 'react-native-gifted-chat'

import { useTheme } from '../../contexts/theme'
import Button, { ButtonType } from '../buttons/Button'
import Text from '../texts/Text'

export interface ChatMessageProps {
  onActionButtonTap: (message: ChatMessage) => void
  messageProps: React.ComponentProps<typeof Message>
}

export interface ChatMessage {
  _id: string
  text: string
  renderText: () => JSX.Element
  record: BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord
  createdAt: Date
  type: string
  user: { _id: string }
}

const renderTime = (props: any, theme: any) => (
  <Text style={{ ...theme.timeStyle }}>
    {new Intl.DateTimeFormat('en-US', { dateStyle: undefined, timeStyle: 'short' }).format(
      props.currentMessage.createdAt
    )}
  </Text>
)

export const ChatMessage: React.FC<ChatMessageProps> = ({ onActionButtonTap, messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()

  const message = useMemo(() => messageProps.currentMessage as unknown as ChatMessage, [messageProps])

  const recordOpenable = useMemo(
    // () => message.record instanceof CredentialExchangeRecord || message.record instanceof ProofExchangeRecord,
    () => true,
    [message]
  )

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: message.user._id === 'sender' ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        style={{
          marginBottom: 16,
          flexDirection: 'column',
          alignItems: 'flex-start',
          alignSelf: 'flex-end',
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
            left: {
              ...theme.leftBubble,
            },
            right: { ...theme.rightBubble },
          }}
          textStyle={{
            left: { ...theme.leftText },
            right: { ...theme.rightText },
          }}
          renderTime={(timeProps: any) => renderTime(timeProps, theme)}
        />
        {recordOpenable && (
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
