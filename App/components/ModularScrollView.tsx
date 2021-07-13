import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import Title from './Title'
import Text from './Text'

import { shadow } from '../globalStyles'

interface Props {
  title: string
  content: string | React.ReactNode
}

const ModularScrollView: React.FC<Props> = ({ title, content }) => {
  return (
    <ScrollView style={styles.container}>
      <Title>{title}</Title>
      {typeof content === 'string' ? <Text style={styles.content}>{content}</Text> : content}
    </ScrollView>
  )
}

export default ModularScrollView

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    backgroundColor: shadow,
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
