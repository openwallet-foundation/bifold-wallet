import React from 'react'
import { Text as T, StyleSheet, TextStyle } from 'react-native'

import { Colors } from '../../Theme'

const styles = StyleSheet.create({
  text: {
    color: Colors.textColor,
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
