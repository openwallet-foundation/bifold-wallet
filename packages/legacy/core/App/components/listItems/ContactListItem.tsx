import type {
  BasicMessageRecord,
  ConnectionRecord,
  CredentialExchangeRecord,
  ProofExchangeRecord,
} from '@aries-framework/core'

import { useBasicMessagesByConnectionId } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native'

import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { useCredentialsByConnectionId } from '../../hooks/credentials'
import { useProofsByConnectionId } from '../../hooks/proofs'
import { Role } from '../../types/chat'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import {
  formatTime,
  getConnectionName,
  getCredentialEventLabel,
  getCredentialEventRole,
  getProofEventLabel,
  getProofEventRole,
} from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

interface CondensedMessage {
  text: string
  createdAt: Date
}
interface Props {
  contact: ConnectionRecord
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ContactListItem: React.FC<Props> = ({ contact, navigation }) => {
  const { t } = useTranslation()
  const { TextTheme, ColorPallet, ListItems } = useTheme()
  const basicMessages = useBasicMessagesByConnectionId(contact.id)
  const credentials = useCredentialsByConnectionId(contact.id)
  const proofs = useProofsByConnectionId(contact.id)
  const [message, setMessage] = useState<CondensedMessage>({ text: '', createdAt: contact.createdAt })
  const [store] = useStore()

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 50,
      height: 50,
      borderRadius: 25,
      borderColor: ListItems.avatarCircle.borderColor,
      borderWidth: 1,
      marginRight: 16,
    },
    avatarPlaceholder: {
      ...TextTheme.headingFour,
      textAlign: 'center',
    },
    avatarImage: {
      width: 30,
      height: 30,
    },
    contactNameContainer: {
      flex: 1,
      paddingVertical: 4,
    },
    nameAndTimeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1,
    },
    contactNameText: {
      ...TextTheme.labelTitle,
    },
    timeContainer: {
      paddingVertical: 4,
      alignSelf: 'center',
    },
    timeText: {
      color: TextTheme.normal.color,
    },
  })

  useEffect(() => {
    const transformedMessages: Array<CondensedMessage> = basicMessages.map((record: BasicMessageRecord) => {
      return {
        text: record.content,
        createdAt: record.updatedAt || record.createdAt,
      }
    })

    transformedMessages.push(
      ...credentials.map((record: CredentialExchangeRecord) => {
        const role = getCredentialEventRole(record)
        const userLabel = role === Role.me ? `${t('Chat.UserYou')} ` : ''
        const actionLabel = t(getCredentialEventLabel(record) as any)
        return {
          text: `${userLabel}${actionLabel}.`,
          createdAt: record.updatedAt || record.createdAt,
        }
      })
    )

    transformedMessages.push(
      ...proofs.map((record: ProofExchangeRecord) => {
        const role = getProofEventRole(record)
        const userLabel = role === Role.me ? `${t('Chat.UserYou')} ` : ''
        const actionLabel = t(getProofEventLabel(record) as any)

        return {
          text: `${userLabel}${actionLabel}.`,
          createdAt: record.updatedAt || record.createdAt,
        }
      })
    )

    // don't show a message snippet for the initial connection
    const connectedMessage = {
      text: '',
      createdAt: contact.createdAt,
    }

    setMessage([...transformedMessages.sort((a: any, b: any) => b.createdAt - a.createdAt), connectedMessage][0])
  }, [basicMessages, credentials, proofs])

  const navigateToContact = useCallback(() => {
    navigation
      .getParent()
      ?.navigate(Stacks.ContactStack, { screen: Screens.Chat, params: { connectionId: contact.id } })
  }, [contact])

  const contactLabel = useMemo(
    () => getConnectionName(contact, store.preferences.alternateContactNames),
    [contact, store.preferences.alternateContactNames]
  )
  const contactLabelAbbr = useMemo(
    () => contactLabel?.charAt(0).toUpperCase(),
    [contact, store.preferences.alternateContactNames]
  )

  return (
    <TouchableOpacity
      onPress={navigateToContact}
      testID={testIdWithKey('Contact')}
      accessibilityLabel={t('ContactDetails.AContact')}
    >
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          {contact.imageUrl ? (
            <View>
              <Image style={styles.avatarImage} source={{ uri: contact.imageUrl }} />
            </View>
          ) : (
            <Text style={styles.avatarPlaceholder}>{contactLabelAbbr}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameAndTimeContainer}>
            <View style={styles.contactNameContainer}>
              <Text style={styles.contactNameText}>{contactLabel}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(message.createdAt, { shortMonth: true, trim: true })}</Text>
            </View>
          </View>
          <View>
            <Text style={TextTheme.normal} numberOfLines={1} ellipsizeMode={'tail'}>
              {message.text}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ContactListItem
