import { ConnectionRecord, ConnectionState } from '@aries-framework/core'
import { useConnectionByState, useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList } from 'react-native'

import ContactListItem from '../components/listItems/ContactListItem'
import EmptyList from '../components/misc/EmptyList'
import { useTheme } from '../contexts/theme'

interface ListContactsProps {
  navigation: any
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const connections = useConnectionByState('completed')
  // const { connections } = useConnections()
  const { ColorPallet } = useTheme()
  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={connections}
      renderItem={({ item }) => <ContactListItem contact={item} navigation={navigation} />}
      keyExtractor={(item: ConnectionRecord) => item?.did || item.id}
      ListEmptyComponent={() => <EmptyList />}
    />
  )
}

export default ListContacts
