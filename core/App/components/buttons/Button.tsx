import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { useTheme } from '../../contexts/theme'

export enum ButtonType {
  Primary,
  Secondary,
  Tertiary,
}

interface ButtonProps {
  title: string
  buttonType: ButtonType
  accessibilityLabel?: string
  testID?: string
  onPress?: () => void
  disabled?: boolean
  styles?: any
}

const Button: React.FC<ButtonProps> = ({
  title,
  buttonType,
  accessibilityLabel,
  testID,
  onPress,
  disabled = false,
  styles,
}) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
  const { Buttons, heavyOpacity } = useTheme()

  const getButtonStyle = () => {
    let buttonStyle = Buttons.primary
    let buttonDisabledStyle = Buttons.primaryDisabled
    let buttonTextStyle = Buttons.primaryText
    let buttonTextDisabledStyle = Buttons.primaryTextDisabled
    switch (buttonType) {
      case ButtonType.Secondary:
        buttonStyle = Buttons.secondary
        buttonDisabledStyle = Buttons.secondaryDisabled
        buttonTextStyle = Buttons.secondaryText
        buttonTextDisabledStyle = Buttons.secondaryTextDisabled
        break

      case ButtonType.Tertiary:
        buttonStyle = Buttons.tertiary
        buttonDisabledStyle = Buttons.tertiaryDisabled
        buttonTextStyle = Buttons.tertiaryText
        buttonTextDisabledStyle = Buttons.tertiaryTextDisabled
        break

      case ButtonType.Primary:
      default:
        buttonStyle = Buttons.primary
        buttonDisabledStyle = Buttons.primaryDisabled
        buttonTextStyle = Buttons.primaryText
        buttonTextDisabledStyle = Buttons.primaryTextDisabled
    }
    return { buttonStyle, buttonDisabledStyle, buttonTextStyle, buttonTextDisabledStyle }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[getButtonStyle().buttonStyle, disabled && getButtonStyle().buttonDisabledStyle, styles]}
      disabled={disabled}
      activeOpacity={heavyOpacity}
    >
      <Text style={[getButtonStyle().buttonTextStyle, disabled && getButtonStyle().buttonTextDisabledStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
