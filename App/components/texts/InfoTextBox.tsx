import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ColorPallet, TextTheme } from '../../theme'

export interface TextBoxProps {
  children: React.ReactElement | string
}

const iconSize = 30
const offset = 10

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ColorPallet.notification.info,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: ColorPallet.notification.infoBorder,
    padding: 10,
  },
  headerText: {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
    fontWeight: 'bold',
    flexShrink: 1,
    alignSelf: 'center',
  },
  icon: {
    marginRight: offset,
    alignSelf: 'center',
  },
})

const InfoTextBox: React.FC<TextBoxProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Icon name={'info'} size={iconSize} color={ColorPallet.notification.infoIcon} />
      </View>
      <Text style={styles.headerText}>{children}</Text>
    </View>
  )
}

export default InfoTextBox
