import React, { useState, useEffect, useContext } from 'react'
import { View } from 'react-native'
import { CredentialEventType } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'
import { decodeInvitationFromUrl } from 'aries-framework'

import { Message, QRScanner } from 'components'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [connection, setConnection] = useState()
  const [credential, setCredential] = useState<any>()

  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [inProgressModalVisible, setInProgressModalVisible] = useState(false)

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

      //}
    } else if (event.credentialRecord.state === 'credential-received') {
      await agentContext.agent.credentials.acceptCredential(event.credentialRecord.id)
    }
  }

  const handleCodeScan = async (event: any) => {
    console.log('Scanned QR Code')
    console.log('BARCODE: ', event)

    const decodedInvitation = await decodeInvitationFromUrl(event.data)

    console.log('New Invitation:', decodedInvitation)
    console.log('AGENT_CONTEXT', agentContext)

    const connectionRecord = await agentContext.agent.connections.receiveInvitation(decodedInvitation, {
      autoAcceptConnection: true,
    })

    console.log('New Connection Record', connectionRecord)
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
      <QRScanner handleCodeScan={handleCodeScan} />
      <Message
        visible={successModalVisible}
        message="Credential Issued"
        icon="check-circle"
        backgroundColor="#1dc249"
      />
      <Message visible={inProgressModalVisible} message="Pending Issuance" icon="alarm" backgroundColor="#4a4a4a" />
    </View>
  )
}
export default Scan
