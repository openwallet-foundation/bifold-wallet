import React from 'react'
import { Bubble } from 'react-native-gifted-chat'

import { ColorPallet, TextTheme } from '../../theme'

export const renderBubble = (props: any) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: ColorPallet.brand.secondaryBackground,
          borderRadius: 20,
          padding: 4,
          marginLeft: -4,
        },
        right: { backgroundColor: ColorPallet.brand.primary, borderRadius: 20, padding: 4, marginRight: 4 },
      }}
      textStyle={{
        left: { color: ColorPallet.brand.secondary, fontSize: TextTheme.normal.fontSize },
        right: { color: ColorPallet.brand.secondary, fontSize: TextTheme.normal.fontSize },
      }}
    />
  )
}
