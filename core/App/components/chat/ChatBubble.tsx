import React from 'react'
import { Bubble } from 'react-native-gifted-chat'

import { useThemeContext } from '../../utils/themeContext'

export const renderBubble = (props: any) => {
  const { ChatTheme } = useThemeContext()
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          ...ChatTheme.leftBubble,
        },
        right: { ...ChatTheme.rightBubble },
      }}
      textStyle={{
        left: { ...ChatTheme.leftText },
        right: { ...ChatTheme.rightText },
      }}
    />
  )
}
