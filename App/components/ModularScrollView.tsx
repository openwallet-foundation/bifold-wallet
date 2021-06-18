import React from 'react'
import { ScrollView, Text, StyleSheet } from 'react-native'

interface Props {
  title: string
  content: string
}

const ModularScrollView: React.FC<Props> = ({ title, content }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </ScrollView>
  )
}

export default ModularScrollView

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: 200,
    width: '90%',
    margin: 20,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  content: {},
})
