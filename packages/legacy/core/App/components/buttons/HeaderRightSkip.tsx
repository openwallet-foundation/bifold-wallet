import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface HeaderButtonProps {
  title: string
  testID?: string
  accessibilityLabel?: string
  onPress?: () => void
  disabled?: boolean
}

const HeaderRight: React.FC<HeaderButtonProps> = ({ title, testID, accessibilityLabel, onPress, disabled = false }) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const style = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    touchableArea: {
      marginRight: 14,
    },
    title: {
      ...TextTheme.label,
      color: ColorPallet.brand.headerText,
      marginRight: 4,
    },
    icon: {
      transform: [{ rotate: '180deg' }],
    },
  })

  return (
    <TouchableOpacity
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      style={[style.touchableArea]}
      disabled={disabled}
    >
      <View style={style.container}>
        <Text style={[style.title]}>{title}</Text>
        <Assets.svg.arrow
          height={TextTheme.label.fontSize}
          width={TextTheme.label.fontSize}
          fill={ColorPallet.brand.headerIcon}
          style={[style.icon]}
        />
      </View>
    </TouchableOpacity>
  )
}

export default HeaderRight
