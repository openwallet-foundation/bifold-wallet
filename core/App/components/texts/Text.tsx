import React from 'react'
import { Text as T, StyleSheet, TextStyle } from 'react-native'

import { useThemeContext } from '../../utils/themeContext'

interface Props {
  children: React.ReactNode
  style?: TextStyle
}

const Text: React.FC<Props> = ({ children, style }) => {
  const { ColorPallet } = useThemeContext()
  const styles = StyleSheet.create({
    text: {
      color: ColorPallet.notification.infoText,
    },
  })
  return <T style={[styles.text, style]}>{children}</T>
}

export default Text
