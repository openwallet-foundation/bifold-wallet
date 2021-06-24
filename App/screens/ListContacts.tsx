import React, { useState, useEffect, useContext } from 'react'
import { ConnectionEventType } from 'aries-framework'
import { FlatList } from 'react-native'

import AgentContext from '../contexts/AgentProvider'

import { ContactListItem, Text } from 'components'
import { backgroundColor } from '../globalStyles'

interface Props {
  navigation: any
}

const ListContacts: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [contacts, setContacts] = useState([])

  const getConnections = async () => {
    const connections = await agentContext.agent.connections.getAll()
    console.log('CONNECTIONS: ', connections)
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
    //TODO: Update Connections List
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
      keyExtractor={(item: any) => item.contact_id}
      style={{ backgroundColor }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>None yet!</Text>}
    />
  )
}

export default ListContacts
