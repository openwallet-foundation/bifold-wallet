import type { ConnectionRecord } from '@aries-framework/core'

import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import { formatTime } from '../../utils/helpers'
import Text from '../texts/Text'

interface Props {
  contact: ConnectionRecord
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ContactListItem: React.FC<Props> = ({ contact, navigation }) => {
  const { TextTheme, ColorPallet } = useTheme()

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
      borderColor: ColorPallet.brand.secondary,
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
    contactNameText: {
      ...TextTheme.labelTitle,
    },
    timeContainer: {
      paddingVertical: 4,
    },
  })

  const navigateToContact = useCallback(() => {
    navigation
      .getParent()
      ?.navigate(Stacks.ContactStack, { screen: Screens.Chat, params: { connectionId: contact.id } })
  }, [contact])

  const contactLabelAbbr = useMemo(() => contact.theirLabel?.charAt(0).toUpperCase(), [contact])

  return (
    <TouchableOpacity onPress={() => navigateToContact()}>
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
        <View style={styles.contactNameContainer}>
          <Text style={styles.contactNameText}>{contact.theirLabel}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text>{formatTime(contact.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ContactListItem
