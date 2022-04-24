import React from 'react'
import { Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props {
  children: React.ReactNode
  style?: any
}

const Title: React.FC<Props> = ({ children, style }) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    title: {
      fontWeight: 'bold',
      fontSize: 20,
      color: ColorPallet.notification.infoText,
    },
  })
  return <Text style={[styles.title, style]}>{children}</Text>
}

export default Title
