import type { ConnectionRecord } from '@aries-framework/core'

import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { dateFormatOptions } from '../../constants'
import { Screens, SettingStackParams, Stacks } from '../../types/navigators'
import { useThemeContext } from '../../utils/themeContext'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  contact: ConnectionRecord
  navigation: StackNavigationProp<SettingStackParams, Screens.Settings>
}

const ContactListItem: React.FC<Props> = ({ contact, navigation }) => {
  const { ListItems, borderRadius } = useThemeContext()
  const styles = StyleSheet.create({
    outerContainer: {
      marginTop: 15,
      marginHorizontal: 15,
      borderRadius: 15,
      backgroundColor: ListItems.contactBackground,
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
      backgroundColor: ListItems.contactIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      borderTopRightRadius: 15,
      borderBottomRightRadius: 15,
    },
    date: {
      marginTop: 10,
    },
  })
  return (
    <TouchableOpacity
      onPress={() =>
        navigation
          .getParent()
          ?.navigate(Stacks.ContactStack, { screen: Screens.Chat, params: { connectionId: contact.id } })
      }
    >
      <View key={contact.id} style={styles.outerContainer}>
        <View style={styles.textContainer}>
          <Title>{contact?.alias || contact?.invitation?.label}</Title>
          <Text style={styles.date}>{contact.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Icon name="message" size={32} color={ListItems.contactIcon} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ContactListItem
