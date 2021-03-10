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

import AppHeader from '../AppHeader/index'
import BackButton from '../BackButton/index'
import CurrentCredential from '../CurrentCredential/index'

import AgentContext from '../AgentProvider/'
import { CredentialEventType } from 'aries-framework-javascript'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { ICredential } from '../../types'

interface IListCredentials {
}

function ListCredentials(props: IListCredentials) {
  let history = useHistory()

  //Reference to the agent context
  const agentContext = useContext(AgentContext)

  //Credential List State
  const [credentials, setCredentials] = useState([])

  //Function to get all credentials and set the state
  const getCredentials = async () => {
    const credentials = await agentContext.agent.credentials.getAll()
    console.log(credentials)

    //TODO: Filter credentials for display
    setCredentials(credentials)
  }

  //On Component Load Fetch all Connections
  useEffect(() => {
    if(!agentContext.loading){
      getCredentials()
    }
  }, [agentContext.loading])

  //Credential Event Callback
  const handleCredentialStateChange = async (event) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)


    //TODO: Filter credentials for display
    //TODO: Update Credentials List
  }

  //Register Event Listener
  useEffect(() => {
    if(!agentContext.loading){
      agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }
  }, [agentContext.loading])




  const [viewInfo, setViewInfo] = useState('')
  const [viewCredential, setViewCredential] = useState(false)

  return (
    <>
      <BackButton backPath={'/home'} />
        <View style={AppStyles.viewFull}>
          <View style={AppStyles.header}>
            <AppHeader headerText={'CREDENTIALS'} />
          </View>
          <View style={[Styles.credView, AppStyles.backgroundSecondary]}>
            <TouchableOpacity
              style={Styles.backbutton}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
              onPress={() => history.push('/home')}>
              <Image source={Images.arrowDown} style={AppStyles.arrow} />
            </TouchableOpacity>
            {credentials.map((credential, i) => (
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
                    {credential.label}
                  </Text>
                  <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                    {credential.sublabel}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setViewInfo(credential)
                    setViewCredential(true)
                  }}>
                  <Image
                    source={Images.infoWhite}
                    style={[AppStyles.info, {marginRight: 10, top: 10}]}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        {viewCredential ? (
              <CurrentCredential
                credential={viewInfo}
                setViewCredential={setViewCredential}
              />
            ) : null}
    </>
  )
}

export default ListCredentials
