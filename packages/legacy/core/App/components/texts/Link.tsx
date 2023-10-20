import React from 'react'
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdForAccessabilityLabel, testIdWithKey } from '../../utils/testable'

interface LinkProps {
  linkText: string
  style?: TextStyle
  textProps?: TextProps
  onPress: () => void
}

const Link: React.FC<LinkProps> = ({ linkText, onPress, style = {}, ...textProps }) => {
  const { TextTheme, ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    link: {
      ...TextTheme.normal,
      color: ColorPallet.brand.link,
      textDecorationLine: 'underline',
      alignSelf: 'flex-start',
    },
  })
  return (
    <Text
      style={[styles.link, style]}
      accessibilityLabel={linkText}
      accessible
      accessibilityRole={'link'}
      testID={testIdWithKey(testIdForAccessabilityLabel(linkText))}
      onPress={onPress}
      {...textProps}
    >
      {linkText}
    </Text>
  )
}

export default Link
