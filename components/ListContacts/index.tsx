import React, { useState, useEffect, useContext } from 'react'

import { Image, Text, TouchableOpacity, View } from 'react-native'

import { useHistory } from 'react-router-native'

import AppHeader from '../AppHeader/index'
import BackButton from '../BackButton/index'
import CurrentContact from '../CurrentContact/index'

import AgentContext from '../AgentProvider/'
import { ConnectionEventType } from 'aries-framework-javascript'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'

interface IListContacts {}

function ListContacts(props: IListContacts) {
  const history = useHistory()

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

  return (
    <>
      <BackButton backPath={'/home'} />
      <View style={AppStyles.viewFull}>
        <View style={AppStyles.header}>
          <AppHeader headerText={'CONTACTS'} />
        </View>
        <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
          <TouchableOpacity
            style={Styles.backbutton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            onPress={() => history.push('/home')}
          >
            <Image source={Images.arrowDown} style={AppStyles.arrow} />
          </TouchableOpacity>
          {contacts.map((contact, i) => (
            <View key={i} style={[AppStyles.tableItem, Styles.tableItem, AppStyles.backgroundSecondary]}>
              <View>
                <Text style={[{ fontSize: 18, top: 8 }, AppStyles.textWhite]}>
                  {contact.alias ? contact.alias : contact.invitation.label}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setViewInfo(contact)
                  setViewContact(true)
                }}
              >
                <Image source={Images.infoWhite} style={[AppStyles.info, { marginRight: 10, top: 10 }]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      {viewContact ? <CurrentContact contact={viewInfo} setViewContact={setViewContact} /> : null}
    </>
  )
}

export default ListContacts
