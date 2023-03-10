import {
  BasicMessageRecord,
  CredentialExchangeRecord,
  CredentialState,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {TouchableOpacity, View} from 'react-native'
import {Bubble, IMessage, Message} from 'react-native-gifted-chat'

import {useTheme} from '../../contexts/theme'
import Text from '../texts/Text'
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export interface ChatMessageProps {
  onActionButtonTap: (message: ChatMessage) => void
  messageProps: React.ComponentProps<typeof Message>
}

export interface ChatMessage extends IMessage {
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
    {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(
      props.currentMessage.createdAt
    )}
  </Text>
)

const renderIcon = (props: any, theme: any) => (
  <View style={{ ...theme.documentIconContainer }}>
    <Icon name={'file-document-outline'} size={32} color={theme.documentIcon.color} />
  </View>
)

export const ChatMessage: React.FC<ChatMessageProps> = ({ onActionButtonTap, messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()

  const message = useMemo(() => messageProps.currentMessage as ChatMessage, [messageProps])

  const recordOpenable = useMemo(
    () =>
      (message.record instanceof CredentialExchangeRecord && message.record.state === CredentialState.Done) ||
      (message.record instanceof ProofExchangeRecord && message.record.state === ProofState.Done && message.record.isVerified),
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
          renderTime={(timeProps: any) => renderTime(timeProps, theme)}
          renderCustomView={() => (recordOpenable ? renderIcon(messageProps, theme) : null)}
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
