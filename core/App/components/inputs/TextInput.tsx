import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput as RNTextInput, TextInputProps } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props extends TextInputProps {
  label: string
}

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)
  const { ColorPallet, TextTheme, borderRadius } = useTheme()
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
      backgroundColor: ColorPallet.brand.primaryBackground,
      color: ColorPallet.notification.infoText,
      borderWidth: 2,
      borderColor: ColorPallet.brand.secondary,
    },
  })
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={[styles.textInput, focused && { borderColor: ColorPallet.brand.primary }]}
        selectionColor={ColorPallet.brand.primary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textInputProps}
      />
    </View>
  )
}

export default TextInput
