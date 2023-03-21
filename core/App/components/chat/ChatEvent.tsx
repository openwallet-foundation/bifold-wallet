import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

import { Role } from './ChatMessage'

interface ChatEventProps {
  userLabel?: string
  actionLabel?: string
  role: Role
}

export const ChatEvent: React.FC<ChatEventProps> = ({ userLabel, actionLabel, role }) => {
  const { t } = useTranslation()
  const { ChatTheme } = useTheme()

  return (
    <View style={{ flexDirection: 'row' }}>
      {userLabel && (
        <Text style={[role === Role.me ? ChatTheme.rightText : ChatTheme.leftText, { marginRight: 4 }]}>
          {t(userLabel as any)}
        </Text>
      )}
      {actionLabel && (
        <Text style={[role === Role.me ? ChatTheme.rightTextHighlighted : ChatTheme.leftTextHighlighted]}>
          {t(actionLabel as any)}
        </Text>
      )}
    </View>
  )
}
