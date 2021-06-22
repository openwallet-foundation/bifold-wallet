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
  //Reference to the agent context
  const agentContext = useContext<any>(AgentContext)

  //Contacts List State
  const [contacts, setContacts] = useState([])

  //Function to get all connections and set the state
  const getConnections = async () => {
    const connections = await agentContext.agent.connections.getAll()
    console.log('CONNECTIONS: ', connections)
    setContacts(connections)
  }

  //On Component Load Fetch all Connections
  useEffect(() => {
    if (!agentContext.loading) {
      getConnections()
    }
  }, [agentContext.loading])

  //Connection Event Callback
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

  //Register Event Listener
  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.connections.events.removeAllListeners(ConnectionEventType.StateChanged)
      agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
    }
  }, [agentContext.loading])

  return (
    <FlatList
      data={contacts}
      renderItem={({ item }) => <ContactListItem contact={item} />}
      keyExtractor={(item: any) => item.contact_id}
      style={{ backgroundColor }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>No Contacts yet!</Text>}
    />
  )
}

export default ListContacts
