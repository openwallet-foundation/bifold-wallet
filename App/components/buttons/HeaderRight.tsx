import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import Arrow from '../../assets/icons/large-arrow.svg'
import { Colors } from '../../theme'

interface HeaderButtonProps {
  title: string
  accessibilityLabel?: string
  onPress?: () => void
  disabled?: boolean
}

const HeaderRight: React.FC<HeaderButtonProps> = ({ title, accessibilityLabel, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{ marginRight: 14 }}
      disabled={disabled}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: Colors.white, fontWeight: 'bold', marginRight: 4 }}>{title}</Text>
        <Arrow height={15} width={15} fill={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
      </View>
    </TouchableOpacity>
  )
}

export default HeaderRight
