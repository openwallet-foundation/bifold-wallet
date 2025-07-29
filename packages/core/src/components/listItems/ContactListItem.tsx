import type { ConnectionRecord } from '@credo-ts/core'

import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'

import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { useChatMessagesByConnection } from '../../hooks/chat-messages'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import { formatTime, getConnectionName } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { TOKENS, useServices } from '../../container-api'
import { ThemedText } from '../texts/ThemedText'

export interface ContactListItemProps {
  contact: ConnectionRecord
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ContactListItem: React.FC<ContactListItemProps> = ({ contact, navigation }) => {
  const { ColorPalette, ListItems } = useTheme()
  const messages = useChatMessagesByConnection(contact)
  const message = messages[0]
  const hasOnlyInitialMessage = messages.length < 2
  const [store] = useStore()
  const [{ enableChat }] = useServices([TOKENS.CONFIG])

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: ColorPalette.brand.secondaryBackground,
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
    timeContainer: {
      paddingVertical: 4,
      alignSelf: 'center',
    },
  })

  const navigateToContact = useCallback(() => {
    navigation.getParent()?.navigate(Stacks.ContactStack, {
      screen: enableChat ? Screens.Chat : Screens.ContactDetails,
      params: { connectionId: contact.id },
    })
  }, [navigation, contact, enableChat])

  const contactLabel = useMemo(
    () => getConnectionName(contact, store.preferences.alternateContactNames),
    [contact, store.preferences.alternateContactNames]
  )
  const contactLabelAbbr = useMemo(() => contactLabel?.charAt(0).toUpperCase(), [contactLabel])

  return (
    <TouchableOpacity
      onPress={navigateToContact}
      testID={testIdWithKey('Contact')}
      accessibilityLabel={contactLabel}
      accessibilityRole="button"
    >
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          {contact.imageUrl ? (
            <View>
              <Image style={styles.avatarImage} source={{ uri: contact.imageUrl }} />
            </View>
          ) : (
            <ThemedText allowFontScaling={false} variant="headingFour" style={styles.avatarPlaceholder}>
              {contactLabelAbbr}
            </ThemedText>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameAndTimeContainer}>
            <View style={styles.contactNameContainer}>
              <ThemedText variant="labelTitle">{contactLabel}</ThemedText>
            </View>
            <View style={styles.timeContainer}>
              {message && <ThemedText>{formatTime(message.createdAt, { shortMonth: true, trim: true })}</ThemedText>}
            </View>
          </View>
          <View>
            {message && !hasOnlyInitialMessage && (
              <ThemedText numberOfLines={1} ellipsizeMode={'tail'}>
                {message.text}
              </ThemedText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ContactListItem
