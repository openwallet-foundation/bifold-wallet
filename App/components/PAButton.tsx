import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface Props {
  title: string
  onPress: () => void
  disabled?: boolean
}

const PAButton: React.FC<Props> = ({ title, disabled, ...otherButtonProps }) => {
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled]} disabled={disabled} {...otherButtonProps}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PAButton

const styles = StyleSheet.create({
  button: {
    width: '90%',
    borderRadius: 5,
    backgroundColor: '#35823f',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
})
