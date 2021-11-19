import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { textColor } from '../../globalStyles'

interface Props {
  children: React.ReactNode
  style?: any
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: textColor,
  },
})

const Title: React.FC<Props> = ({ children, style }) => {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export default Title
