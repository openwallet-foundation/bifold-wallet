import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'

import Text from '../texts/Text'

import { mainColor, shadow } from '../../globalStyles'

interface Props {
  title: string
  onPress: () => void
  disabled?: boolean
}

const PAButton: React.FC<Props> = ({ title, disabled, ...otherButtonProps }) => {
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled]} disabled={disabled} {...otherButtonProps}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PAButton

const styles = StyleSheet.create({
  button: {
    width: '90%',
    borderRadius: 5,
    backgroundColor: mainColor,
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: shadow,
  },
  text: {
    fontSize: 16,
  },
})
