import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { borderRadius, Colors } from '../../Theme'
import Text from '../texts/Text'

interface Props {
  title: string
  accessibilityLabel?: string
  onPress?: () => void
  disabled?: boolean
  neutral?: true
  negative?: true
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    borderRadius,
    backgroundColor: Colors.mainColor,
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: Colors.shadow,
  },
  neutral: {
    backgroundColor: Colors.textColor,
  },
  negative: {
    backgroundColor: '#de3333',
  },
  text: {
    fontSize: 16,
  },
})

const Button: React.FC<Props> = ({ title, accessibilityLabel, onPress, disabled, neutral, negative }) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, disabled && styles.disabled, neutral && styles.neutral, negative && styles.negative]}
      disabled={disabled}
    >
      <Text style={[styles.text, neutral && { color: Colors.shadow }]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default Button
