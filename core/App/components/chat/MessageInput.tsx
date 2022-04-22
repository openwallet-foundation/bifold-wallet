import React from 'react'
import { Composer, InputToolbar, Send } from 'react-native-gifted-chat'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { ChatTheme } from '../../theme'

export const renderInputToolbar = (props: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      ...ChatTheme.inputToolbar,
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

export const renderComposer = (props: any, placeholder: string) => (
  <Composer
    {...props}
    textInputStyle={{
      ...ChatTheme.inputText,
    }}
    placeholder={placeholder}
    placeholderTextColor={ChatTheme.placeholderText}
  />
)

export const renderSend = (props: any) => (
  <Send
    {...props}
    alwaysShowSend={true}
    disabled={!props.text}
    containerStyle={{
      ...ChatTheme.sendContainer,
    }}
  >
    <Icon name="arrow-up-circle" size={38} color={props.text ? ChatTheme.sendEnabled : ChatTheme.sendDisabled} />
  </Send>
)
