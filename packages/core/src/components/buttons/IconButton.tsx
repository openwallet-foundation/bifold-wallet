import React from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

const defaultIconSize = 26

export enum ButtonLocation {
  Left,
  Right,
}

interface IconButtonProps {
  buttonLocation: ButtonLocation
  accessibilityLabel: string
  testID: string
  onPress: () => void
  icon: string
  text?: string
  iconTintColor?: string
}

const IconButton: React.FC<IconButtonProps> = ({
  buttonLocation,
  icon,
  text,
  accessibilityLabel,
  testID,
  onPress,
  iconTintColor,
}) => {
  const { ColorPallet } = useTheme()
  const style = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: buttonLocation === ButtonLocation.Left ? 0 : 15,
      marginLeft: buttonLocation === ButtonLocation.Right ? 0 : 15,
      minWidth: defaultIconSize,
      minHeight: defaultIconSize,
    },
    title: {
      color: ColorPallet.brand.headerText,
      marginRight: 4,
    },
  })

  const myIcon = () => <Icon name={icon} size={defaultIconSize} color={iconTintColor ?? ColorPallet.brand.headerIcon} />

  const myText = () =>
    text ? (
      <ThemedText maxFontSizeMultiplier={1} variant="label" style={style.title}>
        {text}
      </ThemedText>
    ) : null

  const layoutForButtonLocation = (buttonLocation: ButtonLocation) => {
    switch (buttonLocation) {
      case ButtonLocation.Left:
        return (
          <>
            {myIcon()}
            {myText()}
          </>
        )
      case ButtonLocation.Right:
        return (
          <>
            {myText()}
            {myIcon()}
          </>
        )
    }
  }
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={'button'}
      testID={testID}
      onPress={onPress}
      hitSlop={hitSlop}
    >
      <View style={style.container}>{layoutForButtonLocation(buttonLocation)}</View>
    </Pressable>
  )
}

export default IconButton
