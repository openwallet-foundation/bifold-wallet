import React from 'react'
import { Bubble } from 'react-native-gifted-chat'

import { ChatTheme } from '../../theme'

export const renderBubble = (props: any) => {
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
