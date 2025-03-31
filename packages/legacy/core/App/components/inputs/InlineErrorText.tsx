import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { SvgProps } from 'react-native-svg'
import { InlineErrorConfig } from '../../types/error'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

export enum InlineErrorType {
  error,
  warning,
}

export interface InlineMessageProps {
  message: string
  inlineType: InlineErrorType
  config: InlineErrorConfig
}

const InlineErrorText: React.FC<InlineMessageProps> = ({ message, inlineType, config }) => {
  const { InputInlineMessage } = useTheme()
  const style = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignContent: 'center',
      marginVertical: 5,
      paddingRight: 20,
    },
    icon: { marginRight: 4 },
  })

  const color =
    inlineType === InlineErrorType.warning
      ? InputInlineMessage.inlineWarningText.color
      : InputInlineMessage.inlineErrorText.color

  const props: SvgProps = { height: 24, width: 24, color: color, style: style.icon }

  const getInlineErrorIcon = () => {
    if (!config.hasErrorIcon) return null

    if (inlineType === InlineErrorType.warning) {
      return <InputInlineMessage.InlineWarningIcon {...props} />
    } else {
      return <InputInlineMessage.InlineErrorIcon {...props} />
    }
  }

  return (
    <View style={[style.container, config.style]}>
      {getInlineErrorIcon()}
      <ThemedText style={[InputInlineMessage.inlineErrorText]} testID={testIdWithKey('InlineErrorText')}>
        {message}
      </ThemedText>
    </View>
  )
}

export default InlineErrorText
