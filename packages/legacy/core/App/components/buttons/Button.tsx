import React, { forwardRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

import { Button, ButtonType, ButtonProps } from './Button-api'

const ButtonImplComponent = (
  { title, buttonType, accessibilityLabel, accessibilityHint, testID, onPress, disabled = false, children }: ButtonProps,
  ref: React.LegacyRef<TouchableOpacity>
) => {
  const { Buttons, heavyOpacity } = useTheme()
  const buttonStyles = {
    [ButtonType.Critical]: { color: Buttons.critical, text: Buttons.primaryText },
    [ButtonType.Primary]: { color: Buttons.primary, text: Buttons.primaryText },
    [ButtonType.Secondary]: { color: Buttons.secondary, text: Buttons.secondaryText },
    [ButtonType.ModalCritical]: { color: Buttons.modalCritical, text: Buttons.primaryText },
    [ButtonType.ModalPrimary]: { color: Buttons.modalPrimary, text: Buttons.modalPrimaryText },
    [ButtonType.ModalSecondary]: { color: Buttons.modalSecondary, text: Buttons.modalSecondaryText },
  }
  const [isActive, setIsActive] = useState<boolean>(false)

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={'button'}
      onPressIn={() => setIsActive(!disabled && true)}
      onPressOut={() => setIsActive(false)}
      testID={testID}
      style={[
        buttonStyles[buttonType].color,
        disabled && (buttonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
        isActive && buttonType === ButtonType.Secondary && { backgroundColor: Buttons.primary.backgroundColor },
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
            isActive && { textDecorationLine: 'underline' },
            isActive && buttonType === ButtonType.Secondary && { color: Buttons.primaryText.color },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const ButtonImpl = forwardRef<TouchableOpacity, ButtonProps>(ButtonImplComponent)
export default ButtonImpl
export { ButtonType, ButtonImpl }
export type { Button, ButtonProps }
