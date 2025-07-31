import React from 'react'
import { StyleSheet, TextStyle, TextProps } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdForAccessabilityLabel, testIdWithKey } from '../../utils/testable'
import { ThemedText } from './ThemedText'

interface LinkProps {
  linkText: string
  style?: TextStyle
  textProps?: TextProps
  onPress: () => void
  testID?: string
}

const Link: React.FC<LinkProps> = ({ linkText, onPress, style = {}, testID, ...textProps }) => {
  const { ColorPalette } = useTheme()
  const styles = StyleSheet.create({
    link: {
      color: ColorPalette.brand.link,
      textDecorationLine: 'underline',
      alignSelf: 'flex-start',
    },
  })

  return (
    <ThemedText
      style={[styles.link, style]}
      accessibilityLabel={linkText}
      accessible
      accessibilityRole={'link'}
      testID={testID ? testID : testIdWithKey(testIdForAccessabilityLabel(linkText))}
      onPress={onPress}
      {...textProps}
    >
      {linkText}
    </ThemedText>
  )
}

export default Link
