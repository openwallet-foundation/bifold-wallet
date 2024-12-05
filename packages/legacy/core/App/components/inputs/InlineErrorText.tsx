import React from 'react'
import { View, StyleSheet, Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { SvgProps } from 'react-native-svg'
import { InlineErrorConfig } from '../../types/error'
import { testIdWithKey } from '../../utils/testable'

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

  return (
    <View style={[style.container, config.style]}>
      {inlineType === InlineErrorType.warning ? (
        <InputInlineMessage.InlineWarningIcon {...props} />
      ) : (
        <InputInlineMessage.InlineErrorIcon {...props} />
      )}
      <Text style={[InputInlineMessage.inlineErrorText]} testID={testIdWithKey('InlineErrorText')}>
        {message}
      </Text>
    </View>
  )
}

export default InlineErrorText
