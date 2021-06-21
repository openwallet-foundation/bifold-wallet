import React, { useState, useEffect, useContext } from 'react'

import { Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

import { useHistory } from 'react-router-native'

import AgentContext from '../contexts/AgentProvider'
import { ConnectionEventType } from 'aries-framework'

interface Props {}

const ListContacts: React.FC<Props> = () => {
  const history = useHistory()

  const navigation = useNavigation()
  //Reference to the agent context
  const agentContext = useContext(AgentContext)

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
  const handleConnectionStateChange = (event) => {
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

  const [viewInfo, setViewInfo] = useState('')
  const [viewContact, setViewContact] = useState(false)

  function renderContact({ item }) {
    return (
      <TouchableOpacity
        key={item.contact_id}
        onPress={() => navigation.navigate('ContactDetails', { alias: item.alias })}
        style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <Text style={{ fontSize: 20 }}>{item.alias ? item.alias : item.invitation.label}</Text>
        <Icon name="chevron-right" size={30} style={{ bottom: 2 }} />
      </TouchableOpacity>
    )
  }

  const FAKE_CONTACTS = [
    {
      contact_id: 1,
      alias: 'Jeremy Jackson',
    },
    {
      contact_id: 2,
      alias: 'John Walker',
    },
    {
      contact_id: 3,
      alias: 'Peter Piper',
    },
  ]

  return <FlatList data={FAKE_CONTACTS} renderItem={renderContact} style={{ backgroundColor: 'white' }} />
}

export default ListContacts

const styles = StyleSheet.create({
  backbutton: {
    marginBottom: 30,
  },
  tableItem: {
    paddingLeft: 30,
    display: 'flex',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  tableSubItem: {
    height: 50,
  },
  credView: {
    alignItems: 'center',
    padding: 12,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: '100%',
  },
})
