import React from 'react'
import { View, StyleSheet } from 'react-native'

import { Colors, borderRadius } from '../../theme'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  title?: string
  subtitle?: string
  content: string | React.ReactNode
}

const styles = StyleSheet.create({
  container: {
    borderRadius,
    backgroundColor: Colors.shadow,
    width: '90%',
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
      <Title>{title}</Title>
      <Text>{subtitle}</Text>
      {typeof content === 'string' ? <Text style={styles.content}>{content}</Text> : content}
    </View>
  )
}

export default ModularView
