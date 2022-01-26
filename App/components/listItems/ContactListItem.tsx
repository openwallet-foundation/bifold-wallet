import type { ConnectionRecord } from '@aries-framework/core'

import { DateTime } from 'luxon'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { dateFormatString } from '../../constants'
import { borderRadius, ContactTheme } from '../../theme'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  contact: ConnectionRecord
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    borderRadius,
    backgroundColor: ContactTheme.background,
  },
  date: {
    textAlign: 'right',
  },
})

const ContactListItem: React.FC<Props> = ({ contact }) => {
  return (
    <View key={contact.id} style={styles.container}>
      <Title>{contact?.alias || contact?.invitation?.label}</Title>
      <Text>{contact.did}</Text>
      <Text style={styles.date}>{DateTime.fromJSDate(contact.createdAt).toFormat(dateFormatString)}</Text>
    </View>
  )
}

export default ContactListItem
