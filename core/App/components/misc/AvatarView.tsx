import React from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { hashCode, hashToRGBA } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

interface AvatarViewProps {
  name: string
  style?: ViewStyle
}

const AvatarView: React.FC<AvatarViewProps> = ({ name, style }) => {
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    avatar: {
      ...ListItems.avatarCircle,
      margin: 12,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
  return (
    <View style={[styles.avatar, { borderColor: hashToRGBA(hashCode(name)) }, style]}>
      <Text style={ListItems.avatarText} testID={testIdWithKey('AvatarName')}>
        {name.charAt(0)}
      </Text>
    </View>
  )
}

export default AvatarView
