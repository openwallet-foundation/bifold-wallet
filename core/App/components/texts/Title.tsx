import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { useThemeContext } from '../../utils/themeContext'

interface Props {
  children: React.ReactNode
  style?: any
}

const Title: React.FC<Props> = ({ children, style }) => {
  const { TextTheme } = useThemeContext()
  const styles = StyleSheet.create({
    title: {
      ...TextTheme.title,
    },
  })
  return <Text style={[styles.title, style]}>{children}</Text>
}

export default Title
