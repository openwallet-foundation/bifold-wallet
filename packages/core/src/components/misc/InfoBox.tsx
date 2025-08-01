import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
// eslint-disable-next-line import/no-named-as-default
import Button, { ButtonType } from '../buttons/Button'
import { TOKENS, useServices } from '../../container-api'
import { ThemedText } from '../texts/ThemedText'

const iconSize = 30

export enum InfoBoxType {
  Info,
  Success,
  Warn,
  Error,
}

interface InfoBoxProps {
  notificationType: InfoBoxType
  title: string
  description?: string
  bodyContent?: Element
  message?: string
  callToActionDisabled?: boolean
  callToActionIcon?: JSX.Element
  secondaryCallToActionTitle?: string
  secondaryCallToActionPressed?: GenericFn
  secondaryCallToActionDisabled?: boolean
  secondaryCallToActionIcon?: JSX.Element
  onCallToActionPressed?: GenericFn
  onCallToActionLabel?: string
  onClosePressed?: GenericFn
  showVersionFooter?: boolean
  renderShowDetails?: boolean
}

const InfoBox: React.FC<InfoBoxProps> = ({
  notificationType,
  title,
  description,
  bodyContent,
  message,
  callToActionDisabled,
  callToActionIcon,
  secondaryCallToActionTitle,
  secondaryCallToActionPressed,
  secondaryCallToActionDisabled,
  secondaryCallToActionIcon,
  onCallToActionPressed,
  onCallToActionLabel,
  onClosePressed,
  showVersionFooter,
  renderShowDetails = false,
}) => {
  const { width } = useWindowDimensions()
  const { t } = useTranslation()
  const { TextTheme, ColorPalette } = useTheme()
  const [showDetails, setShowDetails] = useState<boolean>(renderShowDetails)
  const [{ showDetailsInfo }] = useServices([TOKENS.CONFIG])
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.brand.modalPrimaryBackground,
      borderColor: ColorPalette.notification.infoBorder,
      borderRadius: 5,
      borderWidth: 1,
      padding: 10,
      minWidth: width - 2 * 25,
    },
    headerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    bodyContainer: {
      flexDirection: 'column',
      marginLeft: 10 + iconSize,
      paddingHorizontal: 5,
      paddingBottom: 5,
      flexGrow: 0,
    },
    headerText: {
      marginLeft: 7,
      flexShrink: 1,
      alignSelf: 'center',
      color: ColorPalette.notification.infoText,
    },
    bodyText: {
      flexShrink: 1,
      marginVertical: 16,
      color: ColorPalette.notification.infoText,
    },
    icon: {
      marginRight: 10,
      alignSelf: 'center',
    },
    showDetailsText: {
      fontWeight: TextTheme.normal.fontWeight,
      color: ColorPalette.brand.link,
    },
  })
  let iconName = 'info'
  let iconColor = ColorPalette.notification.infoIcon

  switch (notificationType) {
    case InfoBoxType.Info:
      iconName = 'info'
      iconColor = ColorPalette.notification.infoIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPalette.notification.info,
        borderColor: ColorPalette.notification.infoBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPalette.notification.infoText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPalette.notification.infoText,
      }
      break

    case InfoBoxType.Success:
      iconName = 'check-circle'
      iconColor = ColorPalette.notification.successIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPalette.notification.success,
        borderColor: ColorPalette.notification.successBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPalette.notification.successText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPalette.notification.successText,
      }
      break

    case InfoBoxType.Warn:
      iconName = 'warning'
      iconColor = ColorPalette.notification.warnIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPalette.notification.warn,
        borderColor: ColorPalette.notification.warnBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPalette.notification.warnText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPalette.notification.warnText,
      }
      break

    case InfoBoxType.Error:
      iconName = 'error'
      iconColor = ColorPalette.notification.errorIcon
      styles.container = {
        ...styles.container,
        backgroundColor: ColorPalette.notification.error,
        borderColor: ColorPalette.notification.errorBorder,
      }
      styles.headerText = {
        ...styles.headerText,
        color: ColorPalette.notification.errorText,
      }
      styles.bodyText = {
        ...styles.bodyText,
        color: ColorPalette.notification.errorText,
      }
      break

    default:
      throw new Error('InfoTextBoxType needs to be set correctly')
  }

  const onShowDetailsTouched = () => {
    setShowDetails(true)
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.icon, { flexDirection: 'row' }]}>
          <Icon accessible={false} name={iconName} size={iconSize} color={iconColor} />
          <ThemedText variant="bold" style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            {title}
          </ThemedText>
        </View>
        {onClosePressed && (
          <View>
            <TouchableOpacity
              accessibilityLabel={t('Global.Dismiss')}
              accessibilityRole={'button'}
              testID={testIdWithKey(`Dismiss${notificationType}`)}
              onPress={onClosePressed}
              hitSlop={hitSlop}
            >
              <Icon name={'close'} size={iconSize} color={ColorPalette.notification.infoIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView style={styles.bodyContainer}>
        <>
          {!showDetails ? bodyContent : null}
          {(description || (message && showDetails)) && (
            <ThemedText style={styles.bodyText} testID={testIdWithKey('BodyText')}>
              {showDetails ? message : description}
            </ThemedText>
          )}
          {message && !showDetails && (showDetailsInfo ?? true) && (
            <TouchableOpacity
              accessibilityLabel={t('Global.ShowDetails')}
              accessibilityRole="button"
              testID={testIdWithKey('ShowDetails')}
              style={{ marginVertical: 14 }}
              onPress={onShowDetailsTouched}
              hitSlop={hitSlop}
            >
              <View style={{ flexDirection: 'row' }}>
                <ThemedText variant="title" style={styles.showDetailsText}>
                  {t('Global.ShowDetails')}{' '}
                </ThemedText>
                <Icon name="chevron-right" size={iconSize} color={ColorPalette.brand.link} />
              </View>
            </TouchableOpacity>
          )}
          {onCallToActionPressed && (
            <View style={{ paddingTop: 10 }}>
              <Button
                title={onCallToActionLabel || t('Global.Okay')}
                accessibilityLabel={onCallToActionLabel || t('Global.Okay')}
                testID={onCallToActionLabel ? testIdWithKey(onCallToActionLabel) : testIdWithKey('Okay')}
                buttonType={ButtonType.Primary}
                onPress={onCallToActionPressed}
                disabled={callToActionDisabled}
              >
                {callToActionIcon}
              </Button>
            </View>
          )}
          {secondaryCallToActionTitle && secondaryCallToActionPressed && (
            <View style={{ paddingTop: 10 }}>
              <Button
                title={secondaryCallToActionTitle}
                accessibilityLabel={secondaryCallToActionTitle}
                testID={testIdWithKey(secondaryCallToActionTitle)}
                buttonType={ButtonType.Secondary}
                onPress={secondaryCallToActionPressed}
                disabled={secondaryCallToActionDisabled}
              >
                {secondaryCallToActionIcon}
              </Button>
            </View>
          )}
          {showVersionFooter ? (
            <ThemedText
              variant="caption"
              style={{ flex: 1, marginTop: 8, textAlign: 'center' }}
              testID={testIdWithKey('VersionNumber')}
            >
              {`${t('Settings.Version')} ${getVersion()} (${getBuildNumber()})`}
            </ThemedText>
          ) : null}
        </>
      </ScrollView>
    </View>
  )
}

export default InfoBox
