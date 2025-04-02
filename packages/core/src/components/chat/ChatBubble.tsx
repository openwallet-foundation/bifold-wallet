import React from 'react'
import { Bubble } from 'react-native-gifted-chat'

export const renderBubble = (props: any, theme: any) => {
  return (
    <Bubble
      {...props}
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
  )
}
