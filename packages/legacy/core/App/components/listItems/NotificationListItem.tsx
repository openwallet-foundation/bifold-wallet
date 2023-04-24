import type { CredentialExchangeRecord, ProofExchangeRecord } from '@aries-framework/core'

import { V1RequestPresentationMessage } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, ViewStyle, Text, TextStyle, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useConfiguration } from '../../contexts/configuration'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { DeclineType } from '../../types/decline'
import { GenericFn } from '../../types/fn'
import { HomeStackParams, Screens, Stacks } from '../../types/navigators'
import { parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import { InfoBoxType } from '../misc/InfoBox'

const iconSize = 30

export enum NotificationType {
  CredentialOffer = 'Offer',
  ProofRequest = 'ProofRecord',
  Revocation = 'Revocation',
  Custom = 'Custom',
  Proof = 'Proof',
}

interface NotificationListItemProps {
  notificationType: NotificationType
  notification: CredentialExchangeRecord | ProofExchangeRecord
}

type DisplayDetails = {
  type: InfoBoxType
  body: string | undefined
  title: string | undefined
  buttonTitle: string | undefined
}

type StyleConfig = {
  containerStyle: ViewStyle
  textStyle: TextStyle
  iconColor: string
  iconName: string
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({ notificationType, notification }) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const { customNotification } = useConfiguration()
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { agent } = useAgent()
  const [details, setDetails] = useState<DisplayDetails>({
    type: InfoBoxType.Info,
    title: undefined,
    body: undefined,
    buttonTitle: undefined,
  })
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    containerStyle: {
      backgroundColor: ColorPallet.notification.info,
      borderColor: ColorPallet.notification.infoBorder,
    },
    textStyle: {
      color: ColorPallet.notification.infoText,
    },
    iconColor: ColorPallet.notification.infoIcon,
    iconName: 'info',
  })

  const styles = StyleSheet.create({
    container: {
      borderRadius: 5,
      borderWidth: 1,
      padding: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    bodyContainer: {
      flexGrow: 1,
      flexDirection: 'column',
      marginLeft: 10 + iconSize,
      paddingHorizontal: 5,
      paddingBottom: 5,
    },
    headerText: {
      ...TextTheme.normal,
      flexGrow: 1,
      fontWeight: 'bold',
      alignSelf: 'center',
      flex: 1,
    },
    bodyText: {
      ...TextTheme.normal,
      flexShrink: 1,
      marginVertical: 15,
      paddingBottom: 10,
    },
    icon: {
      marginRight: 10,
      alignSelf: 'center',
    },
  })
  const { name, version } = parsedSchema(notification as CredentialExchangeRecord)
  let onPress: GenericFn = () => {
    return
  }
  let onClose: GenericFn = () => {
    return
  }

  const detailsForNotificationType = async (notificationType: NotificationType): Promise<DisplayDetails> => {
    return new Promise((resolve) => {
      switch (notificationType) {
        case NotificationType.CredentialOffer:
          resolve({
            type: InfoBoxType.Info,
            title: t('CredentialOffer.NewCredentialOffer'),
            body: `${name + (version ? ` v${version}` : '')}`,
            buttonTitle: undefined,
          })
          break
        case NotificationType.ProofRequest: {
          const proofId = (notification as ProofExchangeRecord).id
          agent?.proofs.findRequestMessage(proofId).then((message) => {
            if (message instanceof V1RequestPresentationMessage && message.indyProofRequest) {
              resolve({
                type: InfoBoxType.Info,
                title: t('ProofRequest.NewProofRequest'),
                body: message.indyProofRequest.name,
                buttonTitle: undefined,
              })
            } else {
              //TODO:(jl) Should we have a default message or stick with an empty string?
              resolve({
                type: InfoBoxType.Info,
                title: t('ProofRequest.NewProofRequest'),
                body: '',
                buttonTitle: undefined,
              })
            }
          })
          break
        }
        case NotificationType.Revocation:
          resolve({
            type: InfoBoxType.Error,
            title: t('CredentialDetails.NewRevoked'),
            body: `${name + (version ? ` v${version}` : '')}`,
            buttonTitle: undefined,
          })
          break
        case NotificationType.Custom:
          resolve({
            type: InfoBoxType.Info,
            title: t(customNotification.title as any),
            body: t(customNotification.description as any),
            buttonTitle: t(customNotification.buttonTitle as any),
          })
          break
        default:
          throw new Error('NotificationType was not set correctly.')
      }
    })
  }

  const setActionForNotificationType = (notificationType: NotificationType): void => {
    switch (notificationType) {
      case NotificationType.CredentialOffer:
        onPress = () => {
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CredentialOffer,
            params: { credentialId: notification.id },
          })
        }
        onClose = () => {
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CommonDecline,
            params: {
              declineType: DeclineType.CredentialOffer,
              itemId: notification.id,
              deleteView: true,
            },
          })
        }
        break
      case NotificationType.ProofRequest:
        onPress = () =>
          navigation
            .getParent()
            ?.navigate(Stacks.NotificationStack, { screen: Screens.ProofRequest, params: { proofId: notification.id } })
        onClose = () => {
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CommonDecline,
            params: {
              declineType: DeclineType.ProofRequest,
              itemId: notification.id,
              deleteView: true,
            },
          })
        }
        break
      case NotificationType.Proof:
        onPress = () =>
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.ProofDetails,
            params: { recordId: notification.id, isHistory: true },
          })
        break
      case NotificationType.Revocation:
        onPress = () =>
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CredentialDetails,
            params: { credential: notification },
          })
        break
      case NotificationType.Custom:
        onPress = () =>
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CustomNotification,
          })
        onClose = () => {
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CommonDecline,
            params: {
              declineType: DeclineType.Custom,
              itemId: notification.id,
              deleteView: true,
              customClose: () => {
                customNotification.onCloseAction(dispatch as any)
              },
            },
          })
        }
        break
      default:
        throw new Error('NotificationType was not set correctly.')
    }
  }

  setActionForNotificationType(notificationType)

  useEffect(() => {
    detailsForNotificationType(notificationType).then((details) => {
      setDetails(details)
    })
  }, [notificationType])

  useEffect(() => {
    switch (details.type) {
      case InfoBoxType.Success:
        setStyleConfig({
          containerStyle: {
            backgroundColor: ColorPallet.notification.success,
            borderColor: ColorPallet.notification.successBorder,
          },
          textStyle: {
            color: ColorPallet.notification.successText,
          },
          iconColor: ColorPallet.notification.successIcon,
          iconName: 'check-circle',
        })
        break
      case InfoBoxType.Warn:
        setStyleConfig({
          containerStyle: {
            backgroundColor: ColorPallet.notification.warn,
            borderColor: ColorPallet.notification.warnBorder,
          },
          textStyle: {
            color: ColorPallet.notification.warnText,
          },
          iconColor: ColorPallet.notification.warnIcon,
          iconName: 'warning',
        })
        break
      case InfoBoxType.Error:
        setStyleConfig({
          containerStyle: {
            backgroundColor: ColorPallet.notification.error,
            borderColor: ColorPallet.notification.errorBorder,
          },
          textStyle: {
            color: ColorPallet.notification.errorText,
          },
          iconColor: ColorPallet.notification.errorIcon,
          iconName: 'error',
        })
        break
      case InfoBoxType.Info:
      default:
        setStyleConfig({
          containerStyle: {
            backgroundColor: ColorPallet.notification.info,
            borderColor: ColorPallet.notification.infoBorder,
          },
          textStyle: {
            color: ColorPallet.notification.infoText,
          },
          iconColor: ColorPallet.notification.infoIcon,
          iconName: 'info',
        })
    }
  }, [details])

  return (
    <View style={[styles.container, styleConfig.containerStyle]} testID={testIdWithKey('NotificationListItem')}>
      <View style={styles.headerContainer}>
        <View style={styles.icon}>
          <Icon name={styleConfig.iconName} size={iconSize} color={styleConfig.iconColor} />
        </View>
        <Text style={[styles.headerText, styleConfig.textStyle]} testID={testIdWithKey('HeaderText')}>
          {details.title}
        </Text>
        {[NotificationType.Custom, NotificationType.ProofRequest, NotificationType.CredentialOffer].includes(
          notificationType
        ) && (
          <View>
            <TouchableOpacity
              accessibilityLabel={t('Global.Close')}
              testID={testIdWithKey(`Close${notificationType}`)}
              onPress={onClose}
            >
              <Icon name={'close'} size={iconSize} color={styleConfig.iconColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.bodyContainer}>
        <Text style={[styles.bodyText, styleConfig.textStyle]} testID={testIdWithKey('BodyText')}>
          {details.body}
        </Text>
        <Button
          title={details.buttonTitle ?? t('Global.View')}
          accessibilityLabel={details.buttonTitle ?? t('Global.View')}
          testID={testIdWithKey(`View${notificationType}`)}
          buttonType={ButtonType.Primary}
          onPress={onPress}
        />
      </View>
    </View>
  )
}

export default NotificationListItem
