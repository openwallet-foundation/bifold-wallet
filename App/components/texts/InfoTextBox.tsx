import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TextBoxTheme, TextTheme } from '../../theme'

export interface TextBoxProps {
  children: string
}

const iconSize = 30
const offset = 10

const style = StyleSheet.create({
  container: {
    // flexGrow: 3,
    flexDirection: 'row',
    backgroundColor: TextBoxTheme.background,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: TextBoxTheme.border,
    padding: 10,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  icon: {
    marginRight: offset,
  },
})

const InfoTextBox: React.FC<TextBoxProps> = ({ children }) => {
  return (
    <View style={[style.container]}>
      <View style={[style.icon]}>
        <Icon name={'info'} size={iconSize} color={TextBoxTheme.text} />
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

export default InfoTextBox
