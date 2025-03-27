import React from 'react'
import { View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { Role } from '../../types/chat'
import { ThemedText } from '../texts/ThemedText'

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
        <ThemedText style={[role === Role.me ? ChatTheme.rightText : ChatTheme.leftText, { marginRight: 4 }]}>
          {userLabel}
        </ThemedText>
      )}
      {actionLabel && (
        <ThemedText style={role === Role.me ? ChatTheme.rightTextHighlighted : ChatTheme.leftTextHighlighted}>
          {actionLabel}
        </ThemedText>
      )}
    </View>
  )
}
