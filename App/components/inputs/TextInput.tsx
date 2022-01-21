import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as TI, TextInputProps } from 'react-native'

import { Colors, borderRadius } from '../../theme'

interface Props extends TextInputProps {
  label: string
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 10,
  },
  label: {
    color: Colors.primary,
    margin: 2,
  },
  textInput: {
    padding: 10,
    borderRadius,
    fontSize: 16,
    backgroundColor: Colors.shadow,
    color: Colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
})

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TI
        style={[styles.textInput, focused && { borderColor: Colors.primary }]}
        selectionColor={Colors.primary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textInputProps}
      />
    </View>
  )
}

export default TextInput
