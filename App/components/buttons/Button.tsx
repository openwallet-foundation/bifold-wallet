import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { Buttons, heavyOpacity } from '../../theme'

export enum ButtonType {
  Primary,
  Secondary,
}

interface ButtonProps {
  title: string
  buttonType: ButtonType
  accessibilityLabel?: string
  testID?: string
  onPress?: () => void
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({
  title,
  buttonType,
  accessibilityLabel,
  testID,
  onPress,
  disabled = false,
}) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessible={accessible}
      testID={testID}
      style={[
        buttonType === ButtonType.Primary ? Buttons.primary : Buttons.secondary,
        disabled && (buttonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
      ]}
      disabled={disabled}
      activeOpacity={heavyOpacity}
    >
      <Text
        style={[
          buttonType === ButtonType.Primary ? Buttons.primaryText : Buttons.secondaryText,
          disabled && (buttonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
