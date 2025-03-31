import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from './ThemedText'

export interface TextBoxProps {
  children: string
}

const offset = 10

const HighlightTextBox: React.FC<TextBoxProps> = ({ children }) => {
  const { ColorPallet, OnboardingTheme } = useTheme()
  const style = StyleSheet.create({
    icon: {
      marginRight: offset,
    },
    container: {
      flexDirection: 'row',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    accentBox: {
      marginRight: offset,
      backgroundColor: ColorPallet.brand.highlight,
      width: 8,
    },
    headerText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
    },
  })
  return (
    <View style={style.container}>
      <View style={style.accentBox} />
      <ThemedText style={[style.headerText, { paddingTop: offset, paddingBottom: offset }]}>{children}</ThemedText>
    </View>
  )
}

export default HighlightTextBox
