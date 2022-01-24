import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as RNTextInput, TextInputProps } from 'react-native'

import { Colors, TextTheme, borderRadius } from '../../theme'

interface Props extends TextInputProps {
  label: string
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    ...TextTheme.label,
    marginBottom: 3,
  },
  textInput: {
    padding: 10,
    borderRadius,
    fontSize: 16,
    backgroundColor: Colors.backgroundLight,
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
      <RNTextInput
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
