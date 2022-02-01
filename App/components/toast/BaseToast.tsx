import React from 'react'
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, TextTheme, borderRadius, borderWidth, StatusColors } from '../../theme'

interface BaseToastProps {
  title: string
  body: string
  toastType: string
}

export enum ToastType {
  Success = 'success',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 25,
    borderWidth,
    borderRadius,
  },
  icon: {
    marginTop: 15,
    marginHorizontal: 15,
  },
  text: {
    flexShrink: 1,
    marginVertical: 15,
    marginRight: 10,
  },
  title: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  body: {
    marginTop: 10,
    color: Colors.text,
  },
})

const BaseToast: React.FC<BaseToastProps> = ({ title, body, toastType }) => {
  const { width } = useWindowDimensions()
  const iconSize = 24
  let iconName = ''
  let backgroundColor = ''
  let borderColor = ''

  switch (toastType) {
    case ToastType.Success:
      iconName = 'check-circle'
      backgroundColor = StatusColors.success
      borderColor = StatusColors.successBorder
      break

    case ToastType.Info:
      iconName = 'info'
      backgroundColor = StatusColors.info
      borderColor = StatusColors.infoBorder
      break

    case ToastType.Warn:
      iconName = 'report-problem'
      backgroundColor = StatusColors.warning
      borderColor = StatusColors.warningBorder
      break

    case ToastType.Error:
      iconName = 'error'
      backgroundColor = StatusColors.error
      borderColor = StatusColors.errorBorder
      break

    default:
      throw new Error('ToastType was not set correctly.')
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor, width: width - width * 0.1 }]}>
      <Icon style={[styles.icon]} name={iconName} color={Colors.text} size={iconSize} />
      <View style={[styles.text]}>
        <Text style={[TextTheme.normal, styles.title]}>{title}</Text>
        <Text style={[TextTheme.normal, styles.body]}>{body}</Text>
      </View>
    </View>
  )
}

export default BaseToast
