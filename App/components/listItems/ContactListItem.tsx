import type { ConnectionRecord } from '@aries-framework/core'

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { dateFormatOptions } from '../../constants'
import { borderRadius, ColorPallet } from '../../theme'
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
    backgroundColor: ColorPallet.brand.secondaryBackground,
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
      <Text style={styles.date}>{contact.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}</Text>
    </View>
  )
}

export default ContactListItem
