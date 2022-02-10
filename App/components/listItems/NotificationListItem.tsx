import type { CredentialRecord, ProofRecord } from '@aries-framework/core'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TextTheme, ColorPallet } from '../../theme'
import { GenericFn } from '../../types/fn'
import { HomeStackParams } from '../../types/navigators'
import { parsedSchema } from '../../utils/helpers'

import Button, { ButtonType } from 'components/buttons/Button'

const { width } = Dimensions.get('window')
const iconSize = 30
const offset = 10
const marginOffset = 25

export enum NotificationType {
  CredentialOffer = 'Offer',
  ProofRequest = 'Proof',
}

interface NotificationCredentialListItemProps {
  notificationType: NotificationType
  notification: CredentialRecord | ProofRecord
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.notification.info,
    borderColor: ColorPallet.notification.infoBorder,
    borderRadius: 5,
    borderWidth: 1,
    // Width adjustment to ensure one notification fits on a "page" at a time.
    width: width - 2 * marginOffset,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingHorizontal: offset,
    paddingTop: offset,
  },
  bodyContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    marginLeft: offset + iconSize - 5,
    paddingHorizontal: offset + 5,
    paddingBottom: offset + 5,
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
    paddingBottom: offset,
    color: ColorPallet.notification.infoText,
  },
  icon: {
    marginRight: offset,
    alignSelf: 'center',
  },
})

const NotificationListItem: React.FC<NotificationCredentialListItemProps> = ({ notificationType, notification }) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const { t } = useTranslation()
  let onPress: GenericFn
  let title = ''
  let body = ''

  switch (notificationType) {
    case NotificationType.CredentialOffer:
      // eslint-disable-next-line no-case-declarations
      const { name, version } = parsedSchema(notification as CredentialRecord)
      onPress = () => navigation.navigate('Credential Offer', { credentialId: notification.id })
      title = t('CredentialOffer.CredentialOffer')
      body = `${name} v${version}`
      break
    case NotificationType.ProofRequest:
      title = t('ProofRequest.ProofRequest')
      body = (notification as ProofRecord).requestMessage?.indyProofRequest?.name || ''
      onPress = () => navigation.navigate('Proof Request', { proofId: notification.id })
      break
    default:
      throw new Error('NotificationType was not set correctly.')
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={[styles.icon]}>
          <Icon name={'info'} size={iconSize} color={ColorPallet.notification.infoIcon} />
        </View>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.bodyText}>{body}</Text>
        <Button buttonType={ButtonType.Primary} title={t('Global.View')} onPress={onPress} />
      </View>
    </View>
  )
}

export default NotificationListItem
