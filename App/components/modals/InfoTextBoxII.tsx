import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TextTheme, ColorPallet } from '../../theme'
import { GenericFn } from '../../types/fn'

import Button, { ButtonType } from 'components/buttons/Button'

const iconSize = 30
const { width } = Dimensions.get('window')

export enum InfoTextBoxIIType {
  Info,
  Success,
  Warn,
  Error,
}

interface BifoldErrorProps {
  notificationType: InfoTextBoxIIType
  title: string
  message: string
  code?: number
  onCallToActionPressed?: GenericFn
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.notification.info,
    borderColor: ColorPallet.notification.infoBorder,
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 25,
    minWidth: width - 2 * 25,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  bodyContainer: {
    // flexGrow: 1,
    flexDirection: 'column',
    marginLeft: 10 + iconSize,
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: ColorPallet.notification.infoText,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    marginVertical: 15,
    paddingBottom: 10,
    color: ColorPallet.notification.infoText,
  },
  icon: {
    marginRight: 10,
    alignSelf: 'center',
  },
})

const InfoTextBoxII: React.FC<BifoldErrorProps> = ({
  notificationType,
  title,
  message,
  code,
  onCallToActionPressed,
}) => {
  const { t } = useTranslation()
  let iconName = 'info'
  let iconColor = ColorPallet.notification.infoIcon

  switch (notificationType) {
    case InfoTextBoxIIType.Info:
      iconName = 'info'
      iconColor = ColorPallet.notification.infoIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.info,
        borderColor: ColorPallet.notification.infoBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPallet.notification.infoText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPallet.notification.infoText,
      }
      break

    case InfoTextBoxIIType.Success:
      iconName = 'check-circle'
      iconColor = ColorPallet.notification.successIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.success,
        borderColor: ColorPallet.notification.successBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPallet.notification.successText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPallet.notification.successText,
      }
      break

    case InfoTextBoxIIType.Warn:
      iconName = 'warning'
      iconColor = ColorPallet.notification.warnIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.warn,
        borderColor: ColorPallet.notification.warnBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPallet.notification.warnText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPallet.notification.warnText,
      }
      break

    case InfoTextBoxIIType.Error:
      iconName = 'info'
      iconColor = ColorPallet.notification.infoIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPallet.notification.error,
        borderColor: ColorPallet.notification.errorBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPallet.notification.errorText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPallet.notification.errorText,
      }
      break

    default:
      throw new Error('InfoTextBoxIIType needs to be set correctly')
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.icon]}>
          <Icon name={iconName} size={iconSize} color={iconColor} />
        </View>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyText}>{message}</Text>
        {code && <Text style={styles.bodyText}>{`${t('Global.ErrorCode')} ${code}`}</Text>}
        {onCallToActionPressed && (
          <Button buttonType={ButtonType.Primary} title={t('Global.Okay')} onPress={onCallToActionPressed} />
        )}
      </View>
    </View>
  )
}

export default InfoTextBoxII
