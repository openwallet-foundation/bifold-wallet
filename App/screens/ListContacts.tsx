import React from 'react'
import { FlatList } from 'react-native'
import { useConnections } from '@aries-framework/react-hooks'
import type { ConnectionRecord } from '@aries-framework/core'

import { ContactListItem, Text } from 'components'
import { backgroundColor } from '../globalStyles'

const ListContacts: React.FC = () => {
  const { connections } = useConnections()

  return (
    <FlatList
      data={connections}
      renderItem={({ item }) => <ContactListItem contact={item} />}
      keyExtractor={(item: ConnectionRecord) => item.did}
      style={{ backgroundColor }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>None yet!</Text>}
    />
  )
}

export default ListContacts
