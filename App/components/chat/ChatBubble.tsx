import React from 'react'
import { ColorPallet, TextTheme } from '../../theme'
import { Bubble, IMessage } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

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
