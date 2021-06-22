import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  title: string
}

const NAButton: React.FC<Props> = ({ title, ...otherButtonProps }) => {
  return (
    <TouchableOpacity style={styles.button} {...otherButtonProps}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default NAButton

const styles = StyleSheet.create({
  button: {
    width: '90%',
    borderRadius: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    margin: 15,
  },
  text: {
    fontSize: 16,
  },
})
