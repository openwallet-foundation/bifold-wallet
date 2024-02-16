import React from 'react'
import { StyleSheet, Pressable, View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'

const defaultIconSize = 26

export enum ButtonLocation {
  Left,
  Right,
}

interface HeaderButtonProps {
  buttonLocation: ButtonLocation
  accessibilityLabel: string
  testID: string
  onPress: () => void
  icon: string
  text?: string
  iconTintColor?: string
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  buttonLocation,
  icon,
  text,
  accessibilityLabel,
  testID,
  onPress,
  iconTintColor,
}) => {
  const { ColorPallet, TextTheme } = useTheme()
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
      ...TextTheme.label,
      color: ColorPallet.brand.headerText,
      marginRight: 4,
    },
  })

  const myIcon = () => <Icon name={icon} size={defaultIconSize} color={iconTintColor ?? ColorPallet.brand.headerIcon} />

  const myText = () => (text ? <Text style={[style.title]}>{text}</Text> : null)

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

export default HeaderButton
