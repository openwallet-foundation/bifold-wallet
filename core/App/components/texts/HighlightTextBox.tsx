import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

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
    <View style={[style.container]}>
      <View style={[style.accentBox]} />
      <Text style={[style.headerText, { paddingTop: offset, paddingBottom: offset }]}>{children}</Text>
    </View>
  )
}

export default HighlightTextBox
