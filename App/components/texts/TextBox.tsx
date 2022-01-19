import Icon from 'react-native-vector-icons/MaterialIcons'
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { Colors, TextTheme } from '../../Theme'

export interface TextBoxProps {
  children: string
}

const iconSize = 30
const offset = 10

const style = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 10,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  icon: {
    marginRight: offset,
  },
  highlightContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
  },
  accentColorBox: {
    marginRight: offset,
    backgroundColor: Colors.accent,
    width: 8,
  },
})

export const InfoTextBox: React.FC<TextBoxProps> = ({ children }) => {
  return (
    <View style={[style.infoContainer]}>
      <View style={[style.icon]}>
        <Icon name={'info'} size={iconSize} color={Colors.textColor} />
      </View>
      <Text
        style={[
          style.headerText,
          {
            fontWeight: 'bold',
          },
        ]}
      >
        {children}
      </Text>
    </View>
  )
}

export const HighlightTextBox: React.FC<TextBoxProps> = ({ children }) => {
  return (
    <View style={[style.highlightContainer]}>
      <View style={[style.accentColorBox]} />
      <Text style={[style.headerText, { paddingTop: offset, paddingBottom: offset }]}>{children}</Text>
    </View>
  )
}
