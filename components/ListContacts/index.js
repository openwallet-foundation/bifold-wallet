import React, {useState, useEffect, useContext} from 'react'

import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import AppHeader from '../AppHeader/index.js'
import BackButton from '../BackButton/index.js'
import CurrentContact from '../CurrentContact/index.js'

import AgentContext from '../AgentProvider/index.js'
import { ConnectionEventType } from 'aries-framework-javascript'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images.js'
import Styles from './styles'

function ListContacts(props) {
  let history = useHistory()

  //Reference to the agent context
  const agentContext = useContext(AgentContext)

  //Contacts List State
  const [contacts, setContacts] = useState([])

  //Function to get all connections and set the state
  const getConnections = async () => {
    const connections = await agentContext.agent.connections.getAll()
    console.log(connections)
    setContacts(connections)
  }

  //On Component Load Fetch all Connections
  useEffect(() => {
    if(!agentContext.loading){
      getConnections()
    }
  }, [agentContext.loading])

  //Connection Event Callback
  const handleConnectionStateChange = (event) => {
    console.info("Connections State Change", event)

    //TODO: Update Connections List
  }

  //Register Event Listener
  useEffect(() => {
    if(!agentContext.loading){
      agentContext.agent.connections.events.removeAllListeners(ConnectionEventType.StateChanged)
      agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
    }
  }, [agentContext.loading])



  const [viewContact, setViewContact] = useState(true)
  const [contactInfo, setContactInfo] = useState('')

  return (
    <>
    <BackButton backPath={'/home'} />
    {viewContact ? (
      <View style={AppStyles.viewFull}>
        <View style={AppStyles.header}>
          <AppHeader headerText={'CONTACTS'} />
        </View>
        <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
          <TouchableOpacity
            style={Styles.backbutton}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
            onPress={() => history.push('/home')}>
            <Image source={Images.arrowDown} style={AppStyles.arrow} />
          </TouchableOpacity>
          {contacts.map((contact, i) => (
              <View
                key={i}
                style={[
                  AppStyles.tableItem,
                  Styles.tableItem,
                  AppStyles.backgroundSecondary,
                ]}>
                <View>
                  <Text
                    style={[
                      {fontSize: 18},
                      AppStyles.textWhite,
                      AppStyles.textUpper,
                    ]}>
                    {contact.label}
                  </Text>
                  <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                    {contact.sublabel}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    console.log(contact.label)
                    setContactInfo(contact)
                    setViewContact(false)
                  }}
                >
                  <Image
                    source={Images.infoWhite}
                    style={[AppStyles.info, {marginRight: 10, top: 10}]}
                  />
                </TouchableOpacity>
              </View>
          ))}
        </View>
    </View>
      ) : 
        <CurrentContact 
          contact={contactInfo}
          setViewContact={setViewContact}
        />
      }
    </>
  )
}

export default ListContacts