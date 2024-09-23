import { V1RequestPresentationMessage } from '@credo-ts/anoncreds'
import {
  Agent,
  BasicMessageRecord,
  BasicMessageRepository,
  CredentialExchangeRecord,
  ProofExchangeRecord,
  ProofState,
} from '@credo-ts/core'
import { useAgent, useConnectionById } from '@credo-ts/react-hooks'
import { markProofAsViewed } from '@hyperledger/aries-bifold-verifier'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { EventTypes, hitSlop } from '../../constants'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { BifoldError } from '../../types/error'
import { GenericFn } from '../../types/fn'
import { BasicMessageMetadata, basicMessageCustomMetadata } from '../../types/metadata'
import { HomeStackParams, Screens, Stacks } from '../../types/navigators'
import { CustomNotification, CustomNotificationRecord } from '../../types/notification'
import { ModalUsage } from '../../types/remove'
import { getConnectionName, parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import { InfoBoxType } from '../misc/InfoBox'
import CommonRemoveModal from '../modals/CommonRemoveModal'

const iconSize = 30

export enum NotificationType {
  BasicMessage = 'BasicMessage',
  CredentialOffer = 'Offer',
  ProofRequest = 'ProofRecord',
  Revocation = 'Revocation',
  Custom = 'Custom',
  Proof = 'Proof',
}

export interface NotificationListItemProps {
  notificationType: NotificationType
  notification: BasicMessageRecord | CredentialExchangeRecord | ProofExchangeRecord | CustomNotificationRecord
  customNotification?: CustomNotification
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

const markMessageAsSeen = async (agent: Agent, record: BasicMessageRecord) => {
  const meta = record.metadata.get(BasicMessageMetadata.customMetadata) as basicMessageCustomMetadata
  record.metadata.set(BasicMessageMetadata.customMetadata, { ...meta, seen: true })
  const basicMessageRepository = agent.context.dependencyManager.resolve(BasicMessageRepository)
  await basicMessageRepository.update(agent.context, record)
}

const defaultDetails: DisplayDetails = {
  type: InfoBoxType.Info,
  title: undefined,
  body: undefined,
  buttonTitle: undefined,
}

const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notificationType,
  notification,
  customNotification,
}) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { agent } = useAgent()
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [action, setAction] = useState<any>()
  const [closeAction, setCloseAction] = useState<any>()
  const connectionId =
    notification instanceof BasicMessageRecord ||
    notification instanceof CredentialExchangeRecord ||
    notification instanceof ProofExchangeRecord
      ? notification.connectionId ?? ''
      : ''
  const connection = useConnectionById(connectionId)
  const [details, setDetails] = useState<DisplayDetails>(defaultDetails)
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
      ...TextTheme.bold,
      flexGrow: 1,
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

  const isReceivedProof = useMemo(() => {
    return notificationType === NotificationType.ProofRequest &&
    ((notification as ProofExchangeRecord).state === ProofState.Done ||
      (notification as ProofExchangeRecord).state === ProofState.PresentationSent)
  }, [notificationType, notification])

  const toggleDeclineModalVisible = useCallback(() => setDeclineModalVisible(prev => !prev), [])

  const declineProofRequest = useCallback(async () => {
    try {
      const proofId = (notification as ProofExchangeRecord).id
      if (agent) {
        await agent.proofs.declineRequest({ proofRecordId: proofId })
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1028'), t('Error.Message1028'), (err as Error)?.message ?? err, 1028)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }

    toggleDeclineModalVisible()
  }, [notification, agent, t, toggleDeclineModalVisible])

  const dismissProofRequest = useCallback(async () => {
    if (agent && notificationType === NotificationType.ProofRequest) {
      markProofAsViewed(agent, notification as ProofExchangeRecord)
    }
  }, [agent, notification, notificationType])

  const dismissBasicMessage = useCallback(async () => {
    if (agent && notificationType === NotificationType.BasicMessage) {
      markMessageAsSeen(agent, notification as BasicMessageRecord)
    }
  }, [agent, notification, notificationType])

  const declineCredentialOffer = useCallback(async () => {
    try {
      const credentialId = (notification as CredentialExchangeRecord).id
      if (agent) {
        await agent.credentials.declineOffer(credentialId)
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1028'), t('Error.Message1028'), (err as Error)?.message ?? err, 1028)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }

    toggleDeclineModalVisible()
  }, [notification, agent, t, toggleDeclineModalVisible])

  const declineCustomNotification = useCallback(async () => {
    customNotification?.onCloseAction(dispatch as any)
    toggleDeclineModalVisible()
  }, [customNotification, dispatch, toggleDeclineModalVisible])

  const commonRemoveModal = () => {
    let usage: ModalUsage | undefined
    let onSubmit: GenericFn | undefined

    if (notificationType === NotificationType.ProofRequest) {
      usage = ModalUsage.ProofRequestDecline
      if ((notification as ProofExchangeRecord).state === ProofState.Done) {
        onSubmit = dismissProofRequest
      } else {
        onSubmit = declineProofRequest
      }
    } else if (notificationType === NotificationType.CredentialOffer) {
      usage = ModalUsage.CredentialOfferDecline
      onSubmit = declineCredentialOffer
    } else if (notificationType === NotificationType.Custom) {
      usage = ModalUsage.CustomNotificationDecline
      onSubmit = declineCustomNotification
    } else {
      usage = undefined
    }

    return usage !== undefined && onSubmit !== undefined ? (
      <CommonRemoveModal
        usage={usage}
        visible={declineModalVisible}
        onSubmit={onSubmit}
        onCancel={toggleDeclineModalVisible}
      />
    ) : null
  }

  useEffect(() => {
    const getDetails = async () => {
      const { name, version } = parsedSchema(notification as CredentialExchangeRecord)
      const theirLabel = getConnectionName(connection, store.preferences.alternateContactNames)
      let details
      switch (notificationType) {
        case NotificationType.BasicMessage:
          details = ({
            type: InfoBoxType.Info,
            title: t('Home.NewMessage'),
            body: theirLabel ? `${theirLabel} ${t('Home.SentMessage')}` : t('Home.ReceivedMessage'),
            buttonTitle: t('Home.ViewMessage'),
          })
          break
        case NotificationType.CredentialOffer:
          details = ({
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
              details = ({
                type: InfoBoxType.Info,
                title: t('ProofRequest.NewProofRequest'),
                body: message.indyProofRequest.name ?? message.comment ?? '',
                buttonTitle: undefined,
              })
            } else {
              details = ({
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
          details =  ({
            type: InfoBoxType.Error,
            title: t('CredentialDetails.NewRevoked'),
            body: `${name + (version ? ` v${version}` : '')}`,
            buttonTitle: undefined,
          })
          break
        case NotificationType.Custom:
          details =  ({
            type: InfoBoxType.Info,
            title: t(customNotification?.title as any),
            body: t(customNotification?.description as any),
            buttonTitle: t(customNotification?.buttonTitle as any),
          })
          break
        default:
          throw new Error('NotificationType was not set correctly.')
      }

      setDetails(details ?? defaultDetails)
    }

    getDetails()
  }, [notification, notificationType, connection, store.preferences.alternateContactNames, t, agent, customNotification])

  useEffect(() => {
    let onPress: () => void
    let onClose: () => void
    switch (notificationType) {
      case NotificationType.BasicMessage:
        onPress = () => {
          navigation.getParent()?.navigate(Stacks.ContactStack, {
            screen: Screens.Chat,
            params: { connectionId: (notification as BasicMessageRecord).connectionId },
          })
        }
        onClose = dismissBasicMessage
        break
      case NotificationType.CredentialOffer:
        onPress = () => {
          navigation.getParent()?.navigate(Stacks.NotificationStack, {
            screen: Screens.CredentialOffer,
            params: { credentialId: notification.id },
          })
        }
        onClose = toggleDeclineModalVisible
        break
      case NotificationType.ProofRequest:
        if (
          (notification as ProofExchangeRecord).state === ProofState.Done ||
          (notification as ProofExchangeRecord).state === ProofState.PresentationReceived
        ) {
          onPress = () => {
            navigation.getParent()?.navigate(Stacks.ContactStack, {
              screen: Screens.ProofDetails,
              params: { recordId: notification.id, isHistory: true },
            })
          }
        } else {
          onPress = () => {
            navigation.getParent()?.navigate(Stacks.NotificationStack, {
              screen: Screens.ProofRequest,
              params: { proofId: (notification as ProofExchangeRecord).id },
            })
          }
        }
        onClose = toggleDeclineModalVisible
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
        onClose = toggleDeclineModalVisible
        break
      default:
        throw new Error('NotificationType was not set correctly.')
    }
    setAction(() => onPress)
    setCloseAction(() => onClose)
  }, [navigation, notification, notificationType, toggleDeclineModalVisible, dismissBasicMessage])

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
  }, [details, ColorPallet])

  return (
    <View style={[styles.container, styleConfig.containerStyle]} testID={testIdWithKey('NotificationListItem')}>
      <View style={styles.headerContainer}>
        <View style={styles.icon}>
          <Icon accessible={false} name={styleConfig.iconName} size={iconSize} color={styleConfig.iconColor} />
        </View>
        <Text style={[styles.headerText, styleConfig.textStyle]} testID={testIdWithKey('HeaderText')}>
          {details.title}
        </Text>
        {[
          NotificationType.BasicMessage,
          NotificationType.Custom,
          NotificationType.ProofRequest,
          NotificationType.CredentialOffer,
        ].includes(notificationType) && (
          <View>
            <TouchableOpacity
              accessibilityLabel={t('Global.Dismiss')}
              accessibilityRole={'button'}
              testID={testIdWithKey(`Dismiss${notificationType}`)}
              onPress={closeAction}
              hitSlop={hitSlop}
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
          testID={testIdWithKey(`View${notificationType}${isReceivedProof ? 'Received' : ''}`)}
          buttonType={ButtonType.Primary}
          onPress={action}
        />
      </View>
      {commonRemoveModal()}
    </View>
  )
}

export default NotificationListItem
