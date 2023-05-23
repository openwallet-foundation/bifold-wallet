import React from 'react'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
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
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  buttonLocation,
  icon,
  text,
  accessibilityLabel,
  testID,
  onPress,
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

  const layoutForButtonLocation = (buttonLocation: ButtonLocation) => {
    switch (buttonLocation) {
      case ButtonLocation.Left:
        return (
          <>
            <Icon name={icon} size={defaultIconSize} color={ColorPallet.brand.headerIcon} />
            {text && <Text style={[style.title]}>{text}</Text>}
          </>
        )
      case ButtonLocation.Right:
        return (
          <>
            {text && <Text style={[style.title]}>{text}</Text>}
            <Icon name={icon} size={defaultIconSize} color={ColorPallet.brand.headerIcon} />
          </>
        )
    }
  }
  return (
    <TouchableOpacity accessibilityLabel={accessibilityLabel} testID={testID} onPress={onPress} hitSlop={hitSlop}>
      <View style={style.container}>{layoutForButtonLocation(buttonLocation)}</View>
    </TouchableOpacity>
  )
}

export default HeaderButton
