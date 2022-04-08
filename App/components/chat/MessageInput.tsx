import React from 'react'
import { ColorPallet, TextTheme } from '../../theme'
import { Composer, InputToolbar, Send } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export const renderInputToolbar = (props: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      justifyContent: 'center',
      backgroundColor: ColorPallet.brand.secondary,
      borderRadius: 10,
      shadowColor: ColorPallet.brand.primaryDisabled,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 2,
    }}
  />
)

export const renderComposer = (props: any, placeholder: string) => (
  <Composer
    {...props}
    textInputStyle={{
      lineHeight: undefined,
      fontWeight: '500',
      fontSize: TextTheme.normal.fontSize,
    }}
    placeholder={placeholder}
    placeholderTextColor={ColorPallet.grayscale.lightGrey}
  />
)

export const renderSend = (props: any) => (
  <Send
    {...props}
    alwaysShowSend={true}
    disabled={!props.text}
    containerStyle={{
      marginBottom: 4,
      paddingHorizontal: 4,
      justifyContent: 'center',
    }}
  >
    <Icon
      name="arrow-up-circle"
      size={38}
      color={props.text ? ColorPallet.brand.primary : ColorPallet.brand.primaryDisabled}
    />
  </Send>
)
