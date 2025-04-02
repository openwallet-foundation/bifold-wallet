import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

interface Props {
  title?: string
  subtitle?: string
  content: string | React.ReactNode
}

const ModularView: React.FC<Props> = ({ title, subtitle, content }) => {
  const { borderRadius, ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius,
      backgroundColor: ColorPallet.notification.info,
      margin: 20,
      padding: 20,
    },
    content: {
      marginTop: 10,
    },
  })
  return (
    <View style={styles.container}>
      <ThemedText variant="headingFour">{title}</ThemedText>
      <ThemedText>{subtitle}</ThemedText>
      {typeof content === 'string' ? <ThemedText style={styles.content}>{content}</ThemedText> : content}
    </View>
  )
}

export default ModularView
