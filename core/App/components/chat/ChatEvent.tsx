import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextStyle, View } from 'react-native'

interface ChatEventProps {
  userLabel?: string
  actionLabel?: string
  userTextStyle: TextStyle
  actionTextStyle: TextStyle
}

export const ChatEvent: React.FC<ChatEventProps> = ({ userLabel, actionLabel, userTextStyle, actionTextStyle }) => {
  const { t } = useTranslation()

  return (
    <View style={{ flexDirection: 'row' }}>
      {userLabel && <Text style={[userTextStyle, { marginRight: 4 }]}>{t(userLabel as any)}</Text>}
      {actionLabel && <Text style={[actionTextStyle]}>{t(actionLabel as any)}</Text>}
    </View>
  )
}
