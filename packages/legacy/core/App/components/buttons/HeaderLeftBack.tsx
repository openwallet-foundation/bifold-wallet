import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'

const defaultIconSize = 38

interface HeaderLeftBackProps {
  title: string
  icon?: string
  testID?: string
  accessibilityLabel?: string
  size?: number
  onPress: () => void
  disabled?: boolean
}

const HeaderLeftBack: React.FC<HeaderLeftBackProps> = ({
  title,
  icon,
  size,
  testID,
  accessibilityLabel,
  onPress,
  disabled = false,
}) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
  const { ColorPallet, TextTheme } = useTheme()
  const style = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    touchableArea: {
      marginLeft: 10,
    },
    title: {
      ...TextTheme.normal,
      marginLeft: -4,
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
        <Icon name={icon || 'chevron-left'} size={size || defaultIconSize} color={ColorPallet.brand.headerIcon} />
        <Text style={[style.title]}>{title}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default HeaderLeftBack
