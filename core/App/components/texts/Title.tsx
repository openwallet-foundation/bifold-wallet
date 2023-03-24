import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props {
  children: React.ReactNode
  style?: any
}

const Title: React.FC<Props> = ({ children, style }) => {
  const { TextTheme } = useTheme()
  const styles = StyleSheet.create({
    title: {
      ...TextTheme.title,
    },
  })
  return (
    <Text adjustsFontSizeToFit style={[styles.title, style]}>
      {children}
    </Text>
  )
}

export default Title
