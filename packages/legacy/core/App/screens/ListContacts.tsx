import { ConnectionRecord, ConnectionType } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList } from 'react-native'

import ContactListItem from '../components/listItems/ContactListItem'
import EmptyList from '../components/misc/EmptyList'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'

interface ListContactsProps {
  navigation: any
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { records } = useConnections()
  const [store] = useStore()
  // Filter out mediator agents
  let connections: ConnectionRecord[] = records
  if (!store.preferences.developerModeEnabled) {
    connections = records.filter((r) => !r.connectionTypes.includes(ConnectionType.Mediator))
  }
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
