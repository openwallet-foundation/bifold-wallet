import React, { useState, useEffect, useContext } from 'react'

import { Image, Text, TouchableOpacity, View, FlatList } from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

import { useHistory } from 'react-router-native'

import AppHeader from '../../components/AppHeader/AppHeader'
import BackButton from '../../components/BackButton'
import CurrentContact from '../../components/CurrentContact'

import AgentContext from '../../contexts/AgentProvider'
import { ConnectionEventType } from 'aries-framework'

import AppStyles from '../../../assets/styles'
import Images from '../../../assets/images'
import Styles from './styles'

interface IListContacts {}

function ListContacts(props: IListContacts) {
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
        onPress={() => {
          navigation.navigate('ContactDetails', { alias: item.alias })
          // setViewInfo(item)
          // setViewContact(true)
        }}
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

  return (
    <FlatList data={FAKE_CONTACTS} renderItem={renderContact} style={{ backgroundColor: 'white' }} />
    // <BackButton backPath={'/home'} />
    // <View style={AppStyles.viewFull}>
    // <View style={AppStyles.header}>
    //     <AppHeader headerText={'CONTACTS'} />
    //   </View>
    // <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
    // <TouchableOpacity
    //       style={Styles.backbutton}
    //       hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    //       onPress={() => history.push('/home')}
    //     >
    //       <Image source={Images.arrowDown} style={AppStyles.arrow} />
    //     </TouchableOpacity>

    // </View>
    // </View>
    // {viewContact ? <CurrentContact contact={viewInfo} setViewContact={setViewContact} /> : null}
  )
}

export default ListContacts
