import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { hashCode, hashToRGBA } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

interface AvatarViewProps {
  name: string
}

const AvatarView: React.FC<AvatarViewProps> = ({ name }) => {
  const { TextTheme, ListItems } = useThemeContext()
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
    <View style={[styles.avatar, { borderColor: hashToRGBA(hashCode(name)) }]}>
      <Text style={ListItems.avatarText} testID={testIdWithKey('AvatarName')}>
        {name.charAt(0)}
      </Text>
    </View>
  )
}

export default AvatarView
