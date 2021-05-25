import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

function PAButton({ title, onPress, ...otherProps }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} {...otherProps}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PAButton

const styles = StyleSheet.create({
  button: {
    width: '85%',
    borderRadius: 10,
    backgroundColor: '#35823f',
    alignItems: 'center',
    padding: 20,
    margin: 10,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
})
