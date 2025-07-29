import React from 'react'
import { View, useWindowDimensions, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Toast from 'react-native-toast-message'
import { ThemedText } from '../texts/ThemedText'

interface BaseToastProps {
  title?: string
  body?: string
  toastType: string
  onPress?: GenericFn
  onShow?: GenericFn
  onHide?: GenericFn
}

export enum ToastType {
  Success = 'success',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const BaseToast: React.FC<BaseToastProps> = ({ title, body, toastType, onPress = () => null }) => {
  const { TextTheme, borderRadius, borderWidth, ColorPalette } = useTheme()
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
      fontWeight: TextTheme.bold.fontWeight,
    },
    body: {
      marginTop: 10,
    },
  })
  switch (toastType) {
    case ToastType.Success:
      iconName = 'check-circle'
      backgroundColor = ColorPalette.notification.success
      borderColor = ColorPalette.notification.successBorder
      iconColor = ColorPalette.notification.successIcon
      textColor = ColorPalette.notification.successText
      break

    case ToastType.Info:
      iconName = 'info'
      backgroundColor = ColorPalette.notification.info
      borderColor = ColorPalette.notification.infoBorder
      iconColor = ColorPalette.notification.infoIcon
      textColor = ColorPalette.notification.infoText
      break

    case ToastType.Warn:
      iconName = 'report-problem'
      backgroundColor = ColorPalette.notification.warn
      borderColor = ColorPalette.notification.warnBorder
      iconColor = ColorPalette.notification.warnIcon
      textColor = ColorPalette.notification.warnText
      break

    case ToastType.Error:
      iconName = 'error'
      backgroundColor = ColorPalette.notification.error
      borderColor = ColorPalette.notification.errorBorder
      iconColor = ColorPalette.notification.errorIcon
      textColor = ColorPalette.notification.errorText
      break

    default:
      throw new Error('ToastType was not set correctly.')
  }

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => onPress()}>
      <View style={[styles.container, { backgroundColor, borderColor, width: width - width * 0.1 }]}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Icon style={styles.icon} name={iconName} color={iconColor} size={iconSize} />
          <View style={styles.textContainer}>
            <ThemedText style={[styles.title, { color: textColor }]} testID={testIdWithKey('ToastTitle')}>
              {title}
            </ThemedText>
            {body && (
              <ThemedText style={[styles.body, { color: textColor }]} testID={testIdWithKey('ToastBody')}>
                {body}
              </ThemedText>
            )}
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              Toast.hide()
            }}
          >
            <Icon style={styles.icon} name={'close'} color={iconColor} size={iconSize} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default BaseToast
