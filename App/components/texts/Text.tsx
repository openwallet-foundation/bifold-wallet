import React from 'react'
import { Text as T, StyleSheet, TextStyle } from 'react-native'

import { textColor } from '../../globalStyles'

const styles = StyleSheet.create({
  text: {
    color: textColor,
  },
})

interface Props {
  children: React.ReactNode
  style?: TextStyle
}

const Text: React.FC<Props> = ({ children, style }) => {
  return <T style={[styles.text, style]}>{children}</T>
}

export default Text
