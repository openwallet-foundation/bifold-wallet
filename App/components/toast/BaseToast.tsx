import React from 'react'
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

interface BaseToastProps {
  title?: string
  body?: string
  toastType: string
}

export enum ToastType {
  Success = 'success',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const BaseToast: React.FC<BaseToastProps> = ({ title, body, toastType }) => {
  const { TextTheme, borderRadius, borderWidth, ColorPallet } = useThemeContext()
  const { width } = useWindowDimensions()
  const iconSize = 24
  let iconName = ''
  let backgroundColor = ''
  let borderColor = ''
  let iconColor = ''
  let textColor = ''
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginTop: 25,
      borderWidth,
      borderRadius,
    },
    textContainer: {
      flexShrink: 1,
      marginVertical: 15,
      marginRight: 10,
    },
    icon: {
      marginTop: 15,
      marginHorizontal: 15,
    },
    title: {
      fontWeight: 'bold',
    },
    body: {
      marginTop: 10,
    },
  })
  switch (toastType) {
    case ToastType.Success:
      iconName = 'check-circle'
      backgroundColor = ColorPallet.notification.success
      borderColor = ColorPallet.notification.successBorder
      iconColor = ColorPallet.notification.successIcon
      textColor = ColorPallet.notification.successText
      break

    case ToastType.Info:
      iconName = 'info'
      backgroundColor = ColorPallet.notification.info
      borderColor = ColorPallet.notification.infoBorder
      iconColor = ColorPallet.notification.infoIcon
      textColor = ColorPallet.notification.infoText
      break

    case ToastType.Warn:
      iconName = 'report-problem'
      backgroundColor = ColorPallet.notification.warn
      borderColor = ColorPallet.notification.warnBorder
      iconColor = ColorPallet.notification.warnIcon
      textColor = ColorPallet.notification.warnText
      break

    case ToastType.Error:
      iconName = 'error'
      backgroundColor = ColorPallet.notification.error
      borderColor = ColorPallet.notification.errorBorder
      iconColor = ColorPallet.notification.errorIcon
      textColor = ColorPallet.notification.errorText
      break

    default:
      throw new Error('ToastType was not set correctly.')
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor, width: width - width * 0.1 }]}>
      <Icon style={[styles.icon]} name={iconName} color={iconColor} size={iconSize} />
      <View style={[styles.textContainer]}>
        <Text style={[TextTheme.normal, styles.title, { color: textColor }]} testID={testIdWithKey('ToastTitle')}>
          {title}
        </Text>
        <Text style={[TextTheme.normal, styles.body, { color: textColor }]} testID={testIdWithKey('ToastBody')}>
          {body}
        </Text>
      </View>
    </View>
  )
}

export default BaseToast
