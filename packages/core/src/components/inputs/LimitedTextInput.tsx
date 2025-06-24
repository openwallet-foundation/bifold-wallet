import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

interface LimitedTextInputProps extends TextInputProps {
  showLimitCounter?: boolean
  label: string
  limit: number
  handleChangeText: (text: string) => void
}

const LimitedTextInput: React.FC<LimitedTextInputProps> = ({
  showLimitCounter = true,
  label,
  limit,
  handleChangeText,
  ...textInputProps
}) => {
  const [focused, setFocused] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const { Inputs, TextTheme, maxFontSizeMultiplier } = useTheme()
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
        maxLength={limit}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[styles.textInput, focused && { ...Inputs.inputSelected }]}
        selectionColor={Inputs.inputSelected.borderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        {...textInputProps}
      />
      {showLimitCounter && (
        <ThemedText style={styles.limitCounter}>
          {characterCount}/{limit}
        </ThemedText>
      )}
    </View>
  )
}

export default LimitedTextInput
