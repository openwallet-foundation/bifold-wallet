import type { CredentialRecord } from '@aries-framework/core'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, StyleSheet, View, Text, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, TextTheme, TextBoxTheme } from '../../theme'
import { GenericFn } from '../../types/fn'
import { HomeStackParams } from '../../types/navigators'
import { parsedSchema } from '../../utils/helpers'

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
  notification: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: TextBoxTheme.background,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: TextBoxTheme.border,
    padding: 10,
  },
  textColum: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  disclosureIconColum: {
    justifyContent: 'center',
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
    fontWeight: 'bold',
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    marginTop: 15,
  },
  icon: {
    marginRight: offset,
  },
})

const NotificationCredentialListItem: React.FC<NotificationCredentialListItemProps> = ({
  notificationType,
  notification,
}) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const { t } = useTranslation()
  let onPress: GenericFn
  let title = ''
  let body = ''

  switch (notificationType) {
    case NotificationType.CredentialOffer:
      // eslint-disable-next-line no-case-declarations
      const { name, version } = parsedSchema(notification)
      onPress = () => navigation.navigate('Credential Offer', { credentialId: notification.id })
      title = t('CredentialOffer.CredentialOffer')
      body = `${name} v${version}`
      break
    case NotificationType.ProofRequest:
      title = t('ProofRequest.ProofRequest')
      body = notification.requestMessage?.indyProofRequest?.name
      onPress = () => navigation.navigate('Proof Request', { proofId: notification.id })
      break
    default:
      throw new Error('NotificationType was not set correctly.')
  }

  return (
    // Width adjustment to ensure one notification fits on a "page"
    // at a time.
    <TouchableOpacity style={[{ width: width - 2 * marginOffset }]} onPress={onPress}>
      <View style={[styles.container]}>
        <View style={[styles.icon]}>
          <Icon name={'info'} size={iconSize} color={TextBoxTheme.text} />
        </View>
        <View style={[styles.textColum]}>
          <Text style={[styles.headerText]}>{title}</Text>
          <Text style={[styles.bodyText]}>{body}</Text>
        </View>
        <View style={[styles.disclosureIconColum]}>
          <Icon name="chevron-right" color={Colors.text} size={iconSize} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default NotificationCredentialListItem
