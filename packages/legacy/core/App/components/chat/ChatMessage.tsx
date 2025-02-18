import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Bubble, IMessage, Message } from 'react-native-gifted-chat'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { Role } from '../../types/chat'
import { formatTime } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

export enum CallbackType {
  CredentialOffer = 'CredentialOffer',
  ProofRequest = 'ProofRequest',
  PresentationSent = 'PresentationSent',
}

export interface ChatMessageProps {
  messageProps: React.ComponentProps<typeof Message>
}

export interface ExtendedChatMessage extends IMessage {
  renderEvent: () => JSX.Element
  createdAt: Date
  messageOpensCallbackType?: CallbackType
  onDetails?: () => void
}

const MessageTime: React.FC<{ message: ExtendedChatMessage }> = ({ message }) => {
  const { ChatTheme: theme } = useTheme()

  return (
    <ThemedText style={message.user._id === Role.me ? theme.timeStyleRight : theme.timeStyleLeft}>
      {formatTime(message.createdAt, { includeHour: true, chatFormat: true, trim: true })}
    </ThemedText>
  )
}

const MessageIcon: React.FC<{ type: CallbackType }> = ({ type }) => {
  const { ChatTheme: theme, Assets } = useTheme()

  return (
    <View style={{ ...theme.documentIconContainer }}>
      {type === CallbackType.CredentialOffer && <Assets.svg.iconCredentialOfferLight width={40} height={40} />}
      {type === CallbackType.PresentationSent && <Assets.svg.iconInfoSentLight width={40} height={40} />}
      {type === CallbackType.ProofRequest && <Assets.svg.iconProofRequestLight width={40} height={40} />}
    </View>
  )
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()
  const message = useMemo(() => messageProps.currentMessage as ExtendedChatMessage, [messageProps])

  const textForCallbackType = (callbackType: CallbackType) => {
    // Receiving a credential offer
    if (callbackType === CallbackType.CredentialOffer) {
      return t('Chat.ViewOffer')
    }

    // Receiving a proof request
    if (callbackType === CallbackType.ProofRequest) {
      return t('Chat.ViewRequest')
    }

    // After a presentation of a proof
    if (callbackType === CallbackType.PresentationSent) {
      return t('Chat.OpenPresentation')
    }

    return t('Chat.OpenItem')
  }

  const testIdForCallbackType = (callbackType: CallbackType) => {
    const text = textForCallbackType(callbackType)
    const textWithoutSpaces = text.replace(/\s+/g, '')

    return testIdWithKey(textWithoutSpaces)
  }

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
          key={messageProps.key}
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
          renderCustomView={() =>
            message.messageOpensCallbackType ? <MessageIcon type={message.messageOpensCallbackType} /> : null
          }
        />
        {message.messageOpensCallbackType && (
          <TouchableOpacity
            accessibilityLabel={textForCallbackType(message.messageOpensCallbackType)}
            accessibilityRole="button"
            testID={testIdForCallbackType(message.messageOpensCallbackType)}
            onPress={() => {
              if (message.onDetails) message.onDetails()
            }}
            style={{
              ...theme.openButtonStyle,
            }}
            hitSlop={hitSlop}
          >
            <ThemedText style={{ ...theme.openButtonTextStyle }}>
              {textForCallbackType(message.messageOpensCallbackType)}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
