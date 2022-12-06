import React, { forwardRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

export enum ButtonType {
  Critical,
  Primary,
  Secondary,
}

export interface ButtonProps {
  title: string
  buttonType: ButtonType
  accessibilityLabel?: string
  testID?: string
  onPress?: () => void
  disabled?: boolean
}

export const Button: React.FC<ButtonProps & React.RefAttributes<HTMLInputElement | undefined>> = forwardRef(
  ({ title, buttonType, accessibilityLabel, children, testID, onPress, disabled = false }, ref: any) => {
    const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
    const { Buttons, heavyOpacity } = useTheme()
    const buttonStyles = {
      [ButtonType.Primary]: { color: Buttons.primary, text: Buttons.primaryText },
      [ButtonType.Secondary]: { color: Buttons.secondary, text: Buttons.secondaryText },
      [ButtonType.Critical]: { color: Buttons.critical, text: Buttons.primaryText },
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[
          buttonStyles[buttonType].color,
          disabled && (buttonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
        ]}
        disabled={disabled}
        activeOpacity={heavyOpacity}
        ref={ref}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
          <Text
            style={[
              buttonStyles[buttonType].text,
              disabled &&
                (buttonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
)

export default Button
