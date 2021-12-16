import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { Colors } from '../../Theme'

interface Props {
  children: React.ReactNode
  style?: any
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: Colors.text,
  },
})

const Title: React.FC<Props> = ({ children, style }) => {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export default Title
