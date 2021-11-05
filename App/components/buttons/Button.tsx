import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { borderRadius, mainColor, shadow, textColor } from '../../globalStyles'
import Text from '../texts/Text'

interface Props {
  title: string
  onPress?: () => void
  disabled?: boolean
  neutral?: true
  negative?: true
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    borderRadius,
    backgroundColor: mainColor,
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: shadow,
  },
  neutral: {
    backgroundColor: textColor,
  },
  negative: {
    backgroundColor: '#de3333',
  },
  text: {
    fontSize: 16,
  },
})

const Button: React.FC<Props> = ({ title, onPress, disabled, neutral, negative }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled, neutral && styles.neutral, negative && styles.negative]}
      disabled={disabled}
    >
      <Text style={[styles.text, neutral && { color: shadow }]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default Button
