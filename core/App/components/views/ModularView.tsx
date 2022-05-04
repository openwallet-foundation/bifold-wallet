import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import Text from '../texts/Text'

interface Props {
  title?: string
  subtitle?: string
  content: string | React.ReactNode
}

const ModularView: React.FC<Props> = ({ title, subtitle, content }) => {
  const { borderRadius, TextTheme, ColorPallet } = useTheme()
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
      <Text style={TextTheme.headingFour}>{title}</Text>
      <Text style={TextTheme.normal}>{subtitle}</Text>
      {typeof content === 'string' ? <Text style={styles.content}>{content}</Text> : content}
    </View>
  )
}

export default ModularView
