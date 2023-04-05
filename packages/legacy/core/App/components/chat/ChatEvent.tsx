import React from 'react'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

import { Role } from './ChatMessage'

interface ChatEventProps {
  userLabel?: string
  actionLabel?: string
  role: Role
}

export const ChatEvent: React.FC<ChatEventProps> = ({ userLabel, actionLabel, role }) => {
  const { ChatTheme } = useTheme()

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {userLabel && (
        <Text style={[role === Role.me ? ChatTheme.rightText : ChatTheme.leftText, { marginRight: 4 }]}>
          {userLabel}
        </Text>
      )}
      {actionLabel && (
        <Text style={[role === Role.me ? ChatTheme.rightTextHighlighted : ChatTheme.leftTextHighlighted]}>
          {actionLabel}
        </Text>
      )}
    </View>
  )
}
