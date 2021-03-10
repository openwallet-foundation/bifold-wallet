import React, {useState, useEffect} from 'react'

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
  const [contactID, setContactID] = useState('')

  useEffect(() => {
    setWorkflowInProgress(true)
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
          setTimeout(() => {
            setWorkflow('requested')
          }, 2200)
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
        path={`${url}/requested`}
        render={() => (
          <CredentialOffered
            setWorkflow={setWorkflow}
            contact={props.contacts[0]}
            credential={props.credentials[0]}
          />
        )}
      />

      <Prompt
        message={(location, action) => {
          //Back button checking
          console.log(action)
          if (
            location.pathname != '/workflow/requested' &&
            workflowInProgress
          ) {
            return `Are you sure you want to exit and lose unsaved progress?`
          }
        }}
      />

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
