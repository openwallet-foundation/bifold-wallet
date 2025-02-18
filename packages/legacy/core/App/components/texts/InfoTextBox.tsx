import React from 'react'
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { InfoBoxType } from '../misc/InfoBox'
import { ThemedText } from './ThemedText'

export interface TextBoxProps {
  children: React.ReactElement | string
  type?: InfoBoxType
  iconVerticalPosition?: 'high' | 'middle'
  iconHorizontalPosition?: 'left' | 'right'
  style?: ViewStyle
  textStyle?: TextStyle
}

const iconSize = 30
const offset = 10

const InfoTextBox: React.FC<TextBoxProps> = ({
  children,
  type = InfoBoxType.Info,
  iconVerticalPosition = 'high',
  iconHorizontalPosition = 'left',
  style = {},
  textStyle = {},
}) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      backgroundColor: ColorPallet.notification.info,
      borderColor: ColorPallet.notification.infoBorder,
      ...style,
    },
    row: {
      flexDirection: iconHorizontalPosition === 'left' ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      alignSelf: 'center',
      flex: 1,
      flexWrap: 'wrap',
      color: ColorPallet.notification.infoText,
      ...textStyle,
    },
    iconContainer: {
      marginRight: iconHorizontalPosition === 'left' ? offset : 0,
      marginLeft: iconHorizontalPosition === 'right' ? offset : 0,
      alignSelf: iconVerticalPosition === 'high' ? 'flex-start' : 'center',
    },
  })

  let iconName = 'info'
  let iconColor = ColorPallet.notification.infoIcon

  switch (type) {
    case InfoBoxType.Info:
      break

    case InfoBoxType.Success:
      iconName = 'check-circle'
      iconColor = ColorPallet.notification.successIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.success,
        borderColor: ColorPallet.notification.successBorder,
      }
      styles.text = {
        ...styles.text,
        color: ColorPallet.notification.successText,
      }
      break

    case InfoBoxType.Warn:
      iconName = 'warning'
      iconColor = ColorPallet.notification.warnIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.warn,
        borderColor: ColorPallet.notification.warnBorder,
      }
      styles.text = {
        ...styles.text,
        color: ColorPallet.notification.warnText,
      }
      break

    case InfoBoxType.Error:
      iconName = 'error'
      iconColor = ColorPallet.notification.errorIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.error,
        borderColor: ColorPallet.notification.errorBorder,
      }
      styles.text = {
        ...styles.text,
        color: ColorPallet.notification.errorText,
      }
      break

    default:
      throw new Error('InfoTextBox type needs to be set correctly')
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={iconSize} color={iconColor} />
        </View>
        {typeof children === 'string' ? (
          <ThemedText variant="bold" style={styles.text}>
            {children}
          </ThemedText>
        ) : (
          <>{children}</>
        )}
      </View>
    </View>
  )
}

export default InfoTextBox
