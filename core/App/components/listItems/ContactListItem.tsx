import type { ConnectionRecord } from '@aries-framework/core'

import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { uiConfig } from '../../config/ui'

import { dateFormatOptions } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { Screens, ContactStackParams, Stacks } from '../../types/navigators'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  contact: ConnectionRecord
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ContactListItem: React.FC<Props> = ({ contact, navigation }) => {
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    outerContainer: {
      ...ListItems.contactBackground,
      marginTop: 15,
      marginHorizontal: 15,
      borderRadius: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    textContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: 15,
    },
    iconContainer: {
      ...ListItems.contactIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      borderTopRightRadius: 15,
      borderBottomRightRadius: 15,
    },
  })
  const handlePress = () => {
    uiConfig.enableChat ? 
      navigation
        .getParent()
        ?.navigate(Stacks.ContactStack, { screen: Screens.Chat, params: { connectionId: contact.id } })
          :
          navigation
          .getParent()
          ?.navigate(Stacks.ContactStack, { screen: Screens.ContactDetails, params: { connectionId: contact.id } })
  }
  return (
    <TouchableOpacity onPress={() => handlePress()}>
      <View key={contact.id} style={styles.outerContainer}>
        <View style={styles.textContainer}>
          <Title style={ListItems.contactTitle}>{contact?.alias || contact?.theirLabel}</Title>
          <Text style={ListItems.contactDate}>{contact.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="message" size={32} color={ListItems.contactIcon.color} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ContactListItem
