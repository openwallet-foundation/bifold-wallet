import type { ConnectionRecord } from '@aries-framework/core'

import { useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList } from 'react-native'

import ContactListItem from '../components/listItems/ContactListItem'
import EmptyList from '../components/misc/EmptyList'
import { useThemeContext } from '../utils/themeContext'

interface ListContactsProps {
  navigation: any
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { connections } = useConnections()
  const { ColorPallet } = useThemeContext()
  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={connections}
      renderItem={({ item }) => <ContactListItem contact={item} navigation={navigation} />}
      keyExtractor={(item: ConnectionRecord) => item.did}
      ListEmptyComponent={() => <EmptyList />}
    />
  )
}

export default ListContacts
