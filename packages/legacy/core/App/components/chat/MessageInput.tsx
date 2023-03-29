import React from 'react'
import { Composer, InputToolbar, Send } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export const renderInputToolbar = (props: any, theme: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      ...theme.inputToolbar,
      justifyContent: 'center',
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

export const renderComposer = (props: any, theme: any, placeholder: string) => (
  <Composer
    {...props}
    textInputStyle={{
      ...theme.inputText,
    }}
    placeholder={placeholder}
    placeholderTextColor={theme.placeholderText}
  />
)

export const renderSend = (props: any, theme: any) => (
  <Send
    {...props}
    alwaysShowSend={true}
    disabled={!props.text}
    containerStyle={{
      ...theme.sendContainer,
    }}
  >
    <Icon name="arrow-up-circle" size={38} color={props.text ? theme.sendEnabled : theme.sendDisabled} />
  </Send>
)
