import React, { useState, useEffect, useContext } from 'react'
import { ConnectionEventType } from 'aries-framework'
import { FlatList, RefreshControl } from 'react-native'

import AgentContext from '../contexts/AgentProvider'

import { ContactListItem, Text } from 'components'
import { backgroundColor, textColor } from '../globalStyles'

interface Props {
  navigation: any
}

const ListContacts: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [contacts, setContacts] = useState<any>()
  const [refreshing, setRefreshing] = useState(false)

  const getConnections = async () => {
    const connections = await agentContext.agent.connections.getAll()
    setContacts(connections)
  }

  const handleConnectionStateChange = (event: any) => {
    console.info('Connections State Change', event)
    const allConnections = [...contacts]
    for (let connection of allConnections) {
      if (connection.id == event.connectionRecord.id) {
        connection = event.connectionRecord
      }
    }
    setContacts(allConnections)
  }

  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.connections.events.removeAllListeners(ConnectionEventType.StateChanged)
      agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
      getConnections()
    }
  }, [agentContext.loading])

  return (
    <FlatList
      data={contacts}
      renderItem={({ item }) => <ContactListItem contact={item} />}
      keyExtractor={(item: any) => item.did}
      style={{ backgroundColor }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>None yet!</Text>}
      refreshControl={<RefreshControl tintColor={textColor} onRefresh={getConnections} refreshing={refreshing} />}
    />
  )
}

export default ListContacts
