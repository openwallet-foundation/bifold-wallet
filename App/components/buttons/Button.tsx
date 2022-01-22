import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'

import { Colors, Buttons, ActiveOpacity } from '../../theme'

export enum ButtonType {
  Primary,
  Secondary,
}

interface ButtonProps {
  title: string
  accessibilityLabel?: string
  onPress?: () => void
  disabled?: boolean
  neutral?: true
  negative?: true
  buttonType?: ButtonType
}

//TODO:(jl) I think these styles should go into the button and
//be used as an ENUM to select the look of the button.
const styles = StyleSheet.create({
  disabled: {
    backgroundColor: Colors.shadow,
  },
  neutral: {
    backgroundColor: Colors.text,
  },
  negative: {
    backgroundColor: 'red',
  },
})

const Button: React.FC<ButtonProps> = ({
  title,
  accessibilityLabel,
  onPress,
  disabled = false,
  neutral = false,
  negative = false,
  buttonType,
}) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
  // Keep this until entire app using ENUM to style.
  const myButtonType = buttonType ? buttonType : ButtonType.Primary

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      style={[
        myButtonType === ButtonType.Primary ? Buttons.primary : Buttons.secondary,
        disabled && (myButtonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
        neutral && styles.neutral,
        negative && styles.negative,
      ]}
      disabled={disabled}
      activeOpacity={ActiveOpacity}
    >
      <Text
        style={[
          myButtonType === ButtonType.Primary ? Buttons.primaryText : Buttons.secondaryText,
          disabled &&
            (myButtonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
          neutral && { color: Colors.shadow },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
