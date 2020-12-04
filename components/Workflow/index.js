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

import CredentialOffered from '../Credential/Offered/index.js'
import CredentialReceived from '../Credential/Received/index.js'
import QRCodeScanner from '../QRCodeScanner/index.js'
import Message from '../Message/index.js'

function Workflow(props) {
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

  /*
    useEffect(()=>{
        if(goToConnect === true){
            //Ask for user confirmation, probably with Alert()
            history.push('/connect');
        }
    }, [goToConnect]);
    /*
    Event
    {
        message:{},
        nextScreen:'/workflow/connecting',
        contactID: UUID
    }
    */
  //manually test -> workflowEvent({})
  //setTimeouts()
  /*
    const workflowEvent = (event) => {
        if(event.contactID == contactID){
            history.push(event.nextScreen)
        }
    }*/

  /* Connecting Screen JSX

<Message 
    title={'Connecting'}
    bgColor={'#F5C155'}
>
    <Image 
        source={Images.arrow} 
        style={{
            alignSelf: 'center', 
            width: 60, 
            height: 68,
        }} 
    />
</Message>

*/

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
            <Message title={'Connecting'} bgColor={'#0A1C40'} textLight={true}>
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
        render={() => <CredentialOffered setWorkflow={setWorkflow} />}
      />

      <Prompt
        message={(location, action) => {
          //Back button checking
          console.log(action)
          if ((location.pathname != '/workflow/requested') && workflowInProgress) {
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
