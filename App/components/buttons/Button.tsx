import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { Buttons, heavyOpacity } from '../../theme'

export enum ButtonType {
  Primary,
  Secondary,
}

interface ButtonProps {
  title: string
  accessibilityLabel?: string
  onPress?: () => void
  disabled?: boolean
  buttonType?: ButtonType
}

const Button: React.FC<ButtonProps> = ({ title, accessibilityLabel, onPress, disabled = false, buttonType }) => {
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
      ]}
      disabled={disabled}
      activeOpacity={heavyOpacity}
    >
      <Text
        style={[
          myButtonType === ButtonType.Primary ? Buttons.primaryText : Buttons.secondaryText,
          disabled &&
            (myButtonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
