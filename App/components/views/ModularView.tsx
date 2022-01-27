import React from 'react'
import { View, StyleSheet } from 'react-native'

import { Colors, borderRadius, TextTheme, CredentialTheme } from '../../theme'
import Text from '../texts/Text'

interface Props {
  title?: string
  subtitle?: string
  content: string | React.ReactNode
}

const styles = StyleSheet.create({
  container: {
    borderRadius,
    backgroundColor: CredentialTheme.background,
    margin: 20,
    padding: 20,
  },
  content: {
    marginTop: 10,
  },
})

const ModularView: React.FC<Props> = ({ title, subtitle, content }) => {
  return (
    <View style={styles.container}>
      <Text style={TextTheme.headingFour}>{title}</Text>
      <Text style={TextTheme.normal}>{subtitle}</Text>
      {typeof content === 'string' ? <Text style={styles.content}>{content}</Text> : content}
    </View>
  )
}

export default ModularView
