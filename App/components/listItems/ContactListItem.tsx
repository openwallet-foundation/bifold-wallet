import type { ConnectionRecord } from '@aries-framework/core'

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { dateFormatOptions } from '../../constants'
import { useThemeContext } from '../../utils/themeContext'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  contact: ConnectionRecord
}

const ContactListItem: React.FC<Props> = ({ contact }) => {
  const { ColorPallet, borderRadius } = useThemeContext()
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
  return (
    <View key={contact.id} style={styles.container}>
      <Title>{contact?.alias || contact?.invitation?.label}</Title>
      <Text>{contact.did}</Text>
      <Text style={styles.date}>{contact.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}</Text>
    </View>
  )
}

export default ContactListItem
