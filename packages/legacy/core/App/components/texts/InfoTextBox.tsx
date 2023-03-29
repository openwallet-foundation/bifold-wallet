import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'

export interface TextBoxProps {
  children: React.ReactElement | string
}

const iconSize = 30
const offset = 10

const InfoTextBox: React.FC<TextBoxProps> = ({ children }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.notification.info,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: ColorPallet.notification.infoBorder,
      padding: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
      fontWeight: 'bold',
      alignSelf: 'center',
      flexShrink: 1,
    },
    iconContainer: {
      marginRight: offset,
      alignSelf: 'center',
    },
  })
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Icon name={'info'} size={iconSize} color={ColorPallet.notification.infoIcon} />
        </View>
        {typeof children === 'string' ? <Text style={styles.textContainer}>{children}</Text> : <>{children}</>}
      </View>
    </View>
  )
}

export default InfoTextBox
