import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as RNTextInput, TextInputProps } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props extends TextInputProps {
  label: string
}

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)
  const { Inputs } = useTheme()
  const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    label: {
      ...Inputs.label,
      marginBottom: 3,
    },
    textInput: {
      ...Inputs.textInput,
    },
  })
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[styles.textInput, focused && { ...Inputs.inputSelected }]}
        selectionColor={Inputs.inputSelected.borderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textInputProps}
      />
    </View>
  )
}

export default TextInput
