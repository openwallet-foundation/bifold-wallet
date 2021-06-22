import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

import Text from './Text'

interface Props {
  contact: any
}

const ContactListItem: React.FC<Props> = ({ contact }) => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      key={contact.contact_id}
      onPress={() => navigation.navigate('ContactDetails', { alias: contact.alias })}
      style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <Text style={{ fontSize: 20 }}>{contact.alias ? contact.alias : contact.invitation.label}</Text>
      <Icon name="chevron-right" size={30} style={{ bottom: 2 }} />
    </TouchableOpacity>
  )
}

export default ContactListItem

const styles = StyleSheet.create({})
