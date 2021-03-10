import React, {useState, useEffect, useContext} from 'react'

import {Alert, Image, Text, View, TouchableWithoutFeedback} from 'react-native'

import {
  Prompt,
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'

import AgentContext from '../AgentProvider/'
import { CredentialEventType } from 'aries-framework-javascript'

import CredentialOffered from './Credential/Offered/index'
import CredentialRequested from './Credential/Requested/index'
import QRCodeScanner from './QRCodeScanner/index'
import Message from '../Message/index'
import { IContact, ICredential } from '../../types'

interface IWorkflow {
  contacts: IContact[]
  credentials: ICredential[]

}

function Workflow(props: IWorkflow) {
  let history = useHistory()
  let {url} = useRouteMatch()

  const [workflow, setWorkflow] = useState('connect')
  const [workflowInProgress, setWorkflowInProgress] = useState(true)
  const [firstRender, setFirstRender] = useState(false)

  const [connection, setConnection] = useState(undefined)
  const [credential, setCredential] = useState(undefined)

  //Reference to the agent context
  const agentContext = useContext(AgentContext)

  //Credential Event Callback
  const handleCredentialStateChange = async (event) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)

    if(event.credentialRecord.state === 'offer-received'){
      //TODO:
      //if(event.credentialRecord.connectionId === contactID){

        const connectionRecord = await agentContext.agent.connections.getById(event.credentialRecord.connectionId)

        setConnection(connectionRecord)

        const previewAttributes = event.credentialRecord.offerMessage.credentialPreview.attributes

        let attributes = {}
        for(const index in previewAttributes){
          attributes[previewAttributes[index].name] = previewAttributes[index].value
        }

        let credentialToDisplay = {
          attributes,
          connectionId: event.credentialRecord.connectionId,
          id: event.credentialRecord.id
        }

        console.log("credentialToDisplay", credentialToDisplay)

        setCredential(credentialToDisplay)

        setWorkflow('offered')
      //}
      
    }
    else if(event.credentialRecord.state === 'credential-received'){
      console.log("attempting to send ack")

      await agentContext.agent.credentials.acceptCredential(event.credentialRecord.id)
      //TODO:
      //Push to credential issued screen
      setWorkflow('issued')
    }

    //TODO: Update Credentials List
  }

  //Register Event Listener
  useEffect(() => {
    if(!agentContext.loading){
      agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }
  }, [agentContext.loading])


  useEffect(() => {
    setWorkflowInProgress(true)

    //Don't re-push the first workflow screen for back-up functionality
    //TODO: Refactor
    if (firstRender) {
      history.push(`${url}/${workflow}`)
    } else {
      setFirstRender(true)
    }
  }, [workflow])

  return (
    <View>
      <Route
        path={`${url}/connect`}
        render={() => (
          <QRCodeScanner
            setWorkflow={setWorkflow}
            setWorkflowInProgress={setWorkflowInProgress}
          />
        )}
      />
      <Route
        path={`${url}/connecting`}
        render={() => {
          return (
            <Message title={'Connecting'} bgColor={'#1B2624'} textLight={true}>
              <Image
                source={Images.waiting}
                style={{
                  alignSelf: 'center',
                  width: 102,
                  height: 115,
                }}
              />
            </Message>
          )
        }}
      />
      <Route
        path={`${url}/offered`}
        render={() => (
          <CredentialOffered
            setWorkflow={setWorkflow}
            contact={connection}
            credential={credential}
          />
        )}
      />
      <Route
        path={`${url}/pending`}
        render={() => {
          return (
            <Message title={'Pending Issuance'} bgColor={'#1B2624'} textLight={true}>
              <Image
                source={Images.waiting}
                style={{
                  alignSelf: 'center',
                  width: 102,
                  height: 115,
                }}
              />
            </Message>
          )
        }}
      />
      <Route
        path={`${url}/issued`}
        render={() => {
          return (
            <Message title={'Credential Issued'} path={'/home'} bgColor={'#1B2624'} textLight={true}>
              <Image
                source={Images.whiteHexCheck}
                style={{
                  alignSelf: 'center',
                  width: 102,
                  height: 115,
                }}
              />
            </Message>
          )
        }}
      />

      {/*<Prompt
        message={(location, action) => {
          //Back button checking
          console.log(action)
          if (
            location.pathname != '/workflow/connect' &&
            location.pathname != '/workflow/connecting' &&
            location.pathname != '/workflow/issued' 
          ) {
            return `Are you sure you want to exit and lose unsaved progress?`
          }
        }}
      />*/}

      {/*
      render={() => (
                  authenticated ? ( 
                    <Workflow />
                  ) : (
                    <Redirect to="/" />
                  )
                )}
      
      */}
    </View>
  )
}
export default Workflow
