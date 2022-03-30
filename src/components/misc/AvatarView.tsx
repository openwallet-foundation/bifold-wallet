import React from 'react'
import { StyleSheet, View } from 'react-native'

import { hashCode, hashToRGBA } from '../../utils/helpers'
import { useThemeContext } from '../../utils/themeContext'
import Title from '../texts/Title'

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
      <Title style={{ ...TextTheme.headingTwo, fontWeight: 'normal' }}>{name.charAt(0)}</Title>
    </View>
  )
}

export default AvatarView
