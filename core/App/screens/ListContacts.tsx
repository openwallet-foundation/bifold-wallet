import { useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList } from 'react-native'

import ContactListItem from '../components/listItems/ContactListItem'
import EmptyList from '../components/misc/EmptyList'
import { useTheme } from '../contexts/theme'

interface ListContactsProps {
  navigation: any
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { records: connections } = useConnections()
  const { ColorPallet } = useTheme()
  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={connections}
      keyExtractor={(connection) => connection.id}
      renderItem={({ item: connection }) => <ContactListItem contact={connection} navigation={navigation} />}
      ListEmptyComponent={() => <EmptyList />}
    />
  )
}

export default ListContacts
