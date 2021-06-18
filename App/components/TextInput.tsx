import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as TI } from 'react-native'

interface Props {
  label: string
}

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TI
        style={[styles.textInput, focused && { borderColor: '#35823f', borderWidth: 2 }]}
        selectionColor="#35823f"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textInputProps}
      />
    </View>
  )
}

export default TextInput

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 10,
  },
  label: {
    color: '#35823f',
    margin: 2,
  },
  textInput: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'gray',
    fontSize: 16,
  },
})
