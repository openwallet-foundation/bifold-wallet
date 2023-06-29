import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface Props extends TextInputProps {
  label: string
  limit: number
  handleChangeText: (text: string) => void
}

const LimitedTextInput: React.FC<Props> = ({ label, limit, handleChangeText, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const { Inputs, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    label: {
      ...TextTheme.normal,
      marginBottom: 5,
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
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.textInput, focused && { ...Inputs.inputSelected }]}
        selectionColor={Inputs.inputSelected.borderColor}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        {...textInputProps}
      />
      <Text style={styles.limitCounter}>
        {characterCount}/{limit}
      </Text>
    </View>
  )
}

export default LimitedTextInput
