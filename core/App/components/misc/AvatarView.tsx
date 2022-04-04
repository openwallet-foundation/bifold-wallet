import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { hashCode, hashToRGBA } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

interface AvatarViewProps {
  name: string
}

const AvatarView: React.FC<AvatarViewProps> = ({ name }) => {
  const { TextTheme } = useThemeContext()
  const styles = StyleSheet.create({
    avatar: {
      width: TextTheme.headingTwo.fontSize * 2,
      height: TextTheme.headingTwo.fontSize * 2,
      margin: 12,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: TextTheme.headingTwo.fontSize,
      borderColor: TextTheme.headingTwo.color,
    },
  })
  return (
    <View style={[styles.avatar, { borderColor: hashToRGBA(hashCode(name)) }]}>
      <Text style={[TextTheme.headingTwo, { fontWeight: 'normal' }]} testID={testIdWithKey('AvatarName')}>
        {name.charAt(0)}
      </Text>
    </View>
  )
}

export default AvatarView
