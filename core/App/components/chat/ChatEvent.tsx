import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface ChatEventProps {
  userLabel?: string
  actionLabel?: string
}

export const ChatEvent: React.FC<ChatEventProps> = ({ userLabel, actionLabel }) => {
  const { ChatTheme: theme } = useTheme()
  const { t } = useTranslation()

  return (
    <View style={{ flexDirection: 'row' }}>
      {userLabel && <Text style={[theme.leftText, { marginRight: 4 }]}>{t(userLabel as any)}</Text>}
      {actionLabel && <Text style={[theme.leftText, theme.leftTextHighlighted]}>{t(actionLabel as any)}</Text>}
    </View>
  )
}
