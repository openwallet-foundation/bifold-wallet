import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Props {
  title: string
  subtitle: string
}

const Label: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}:</Text>
      <Text>{subtitle}</Text>
    </View>
  )
}

export default Label

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 15,
    marginVertical: 10,
  },
})
