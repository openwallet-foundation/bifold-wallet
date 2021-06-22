import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import Title from './Title'
import Text from './Text'

interface Props {
  title: string
  content: string
}

const ModularScrollView: React.FC<Props> = ({ title, content }) => {
  return (
    <ScrollView style={styles.container}>
      <Title>{title}</Title>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  )
}

export default ModularScrollView

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: 250,
    width: '90%',
    margin: 20,
    padding: 20,
  },
  content: {
    marginTop: 10,
    marginBottom: 50,
  },
})
