import React, { useState, useEffect, useContext } from 'react'
import { View } from 'react-native'
import { CredentialEventType } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'
import QRCodeScanner from './QRCodeScanner'

import { Message } from 'components'

function Workflow() {
  const agentContext = useContext<any>(AgentContext)

  const [connection, setConnection] = useState()
  const [credential, setCredential] = useState<any>()
  const [modalVisible, setModalVisible] = useState('')

  const handleCredentialStateChange = async (event: any) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)

    if (event.credentialRecord.state === 'offer-received') {
      //TODO:
      //if(event.credentialRecord.connectionId === contactID){
      const connectionRecord = await agentContext.agent.connections.getById(event.credentialRecord.connectionId)

      setConnection(connectionRecord)

      const previewAttributes = event.credentialRecord.offerMessage.credentialPreview.attributes
      console.log('PREVIEW ATTRIBUTES', previewAttributes)
      const attributes: any = {}
      for (const index in previewAttributes) {
        attributes[previewAttributes[index].name] = previewAttributes[index].value
      }

      const credentialToDisplay = {
        attributes,
        connectionId: event.credentialRecord.connectionId,
        id: event.credentialRecord.id,
      }

      setCredential(credentialToDisplay)
      console.log('CRED_TO_DISPLAY', credentialToDisplay)

      setModalVisible('inProgress')
      //}
    } else if (event.credentialRecord.state === 'credential-received') {
      await agentContext.agent.credentials.acceptCredential(event.credentialRecord.id)
      setModalVisible('success')
    }
  }

  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }
  }, [agentContext.loading])

  console.log('CONNECTION', connection)
  console.log('CREDENTIAL', credential)

  return (
    <View>
      <QRCodeScanner />
      <Message
        visible={modalVisible === 'success'}
        message="Credential Issued"
        icon="check-circle"
        backgroundColor="#1dc249"
      />
      <Message
        visible={modalVisible === 'inProgress'}
        message="Pending Issuance"
        icon="alarm"
        backgroundColor="#4a4a4a"
      />
      <Message
        visible={modalVisible === 'failure'}
        message="Issuance Failed"
        icon="warning"
        backgroundColor="#de524e"
      />
    </View>
  )
}
export default Workflow
