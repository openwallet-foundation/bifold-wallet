import React, { useState, useEffect } from 'react'
import { Pressable, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTheme } from '../../contexts/theme'

interface ToggleButtonProps {
  isEnabled: boolean
  isAvailable: boolean
  toggleAction: () => void
  testID?: string
  enabledIcon?: string
  disabledIcon?: string
  disabled?: boolean
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isEnabled,
  isAvailable,
  toggleAction,
  testID,
  enabledIcon = 'check',
  disabledIcon = 'close',
  disabled = false,
}) => {
  const { ColorPallet } = useTheme()
  const [toggleAnim] = useState(new Animated.Value(isEnabled ? 1 : 0))

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isEnabled, toggleAnim])

  const backgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [ColorPallet.grayscale.lightGrey, ColorPallet.brand.primary],
  })

  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 25],
  })

  return (
    <Pressable
      accessible
      testID={testID}
      accessibilityLabel="Toggle Button"
      accessibilityRole="switch"
      accessibilityState={{
        checked: isEnabled
      }}
      onPress={isAvailable && !disabled ? toggleAction : undefined} // Prevent onPress if not available or disabled
      disabled={!isAvailable || disabled}
    >
      <Animated.View
        style={{
          width: 55,
          height: 30,
          borderRadius: 25,
          backgroundColor,
          padding: 3,
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1, // Visual feedback for disabled state
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
            width: 25,
            height: 25,
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            name={isEnabled ? enabledIcon : disabledIcon}
            size={15}
            color={isEnabled ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

export default ToggleButton
