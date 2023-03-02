import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Bubble, Message } from 'react-native-gifted-chat'

import { useTheme } from '../../contexts/theme'
import Button, { ButtonType } from '../buttons/Button'

export interface ChatMessageProps {
  onActionButtonTap: (message: any) => void
  messageProps: React.ComponentProps<typeof Message>
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ onActionButtonTap, messageProps }) => {
  const { t } = useTranslation()
  const { ChatTheme: theme } = useTheme()

  return (
    <View>
      <Bubble
        {...messageProps}
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
      />
      <Button
        title={t('Chat.OpenItem')}
        buttonType={ButtonType.Primary}
        onPress={() => {
          if (messageProps.currentMessage) onActionButtonTap(messageProps.currentMessage)
        }}
      />
    </View>
  )
}
