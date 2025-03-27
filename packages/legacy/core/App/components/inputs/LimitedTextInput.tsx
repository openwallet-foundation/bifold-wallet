import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'
import { TOKENS, useServices } from '../../container-api'

interface Props extends TextInputProps {
  label: string
  limit: number
  handleChangeText: (text: string) => void
}

const LimitedTextInput: React.FC<Props> = ({ label, limit, handleChangeText, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const { Inputs, TextTheme } = useTheme()
  const [{ accessibilityMaxFontSizeMultiplier = 2 }] = useServices([TOKENS.CONFIG])
  const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
      width: '100%',
    },
    textInput: {
      ...Inputs.textInput,
    },
    limitCounter: {
      color: TextTheme.normal.color,
      alignSelf: 'flex-end',
    },
  })

  useEffect(() => {
    if (textInputProps.defaultValue?.length) {
      setCharacterCount(textInputProps.defaultValue.length)
    }
  }, [textInputProps.defaultValue])

  const onChangeText = (text: string) => {
    setCharacterCount(text.length)
    handleChangeText(text)
  }

  return (
    <View style={styles.container}>
      <ThemedText style={{ marginBottom: 5 }}>{label}</ThemedText>
      <TextInput
        maxFontSizeMultiplier={accessibilityMaxFontSizeMultiplier}
        style={[styles.textInput, focused && { ...Inputs.inputSelected }]}
        selectionColor={Inputs.inputSelected.borderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        {...textInputProps}
      />
      <ThemedText style={styles.limitCounter}>
        {characterCount}/{limit}
      </ThemedText>
    </View>
  )
}

export default LimitedTextInput
