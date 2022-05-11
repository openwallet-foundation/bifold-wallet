import React from 'react'
import { Text as T, StyleSheet, TextStyle } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props {
  children: React.ReactNode
  style?: TextStyle
}

const Text: React.FC<Props> = ({ children, style }) => {
  const { TextTheme } = useTheme()
  const styles = StyleSheet.create({
    text: {
      color: TextTheme.normal.color,
    },
  })
  return <T style={[styles.text, style]}>{children}</T>
}

export default Text
