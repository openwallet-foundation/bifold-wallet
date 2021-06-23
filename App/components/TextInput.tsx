import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as TI } from 'react-native'

import { mainColor, textColor } from '../globalStyles'

interface Props {
  label: string
  maxLength?: number
}

const TextInput: React.FC<Props> = ({ label, maxLength, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TI
        style={[styles.textInput, focused && { borderColor: mainColor, borderWidth: 2 }]}
        selectionColor={mainColor}
        maxLength={maxLength}
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
    color: mainColor,
    margin: 2,
  },
  textInput: {
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: 'black',
    color: textColor,
  },
})
