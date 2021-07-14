import React, { useState, useEffect, useContext } from 'react'
import { View } from 'react-native'
import { CredentialEventType, ConnectionEventType, ConnectionState, CredentialState } from 'aries-framework'
import '@azure/core-asynciterator-polyfill'

import AgentContext from '../contexts/AgentProvider'
import { decodeInvitationFromUrl } from 'aries-framework'

import { Message, QRScanner } from 'components'

import { backgroundColor, mainColor } from '../globalStyles'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [connection, setConnection] = useState()
  const [credential, setCredential] = useState<any>()

  const [modalVisible, setModalVisible] = useState<'inProgress' | 'success' | 'failure' | ''>('')

  const handleCredentialStateChange = async (event: any) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)

    switch (event.credentialRecord.state) {
      case CredentialState.OfferReceived:
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

      case CredentialState.CredentialReceived:
        await agentContext.agent.credentials.acceptCredential(event.credentialRecord.id)

      default:
        return
    }
  }

  const handleConnectionStateChange = async (event: any) => {
    switch (event.connectionRecord.state) {
      case ConnectionState.Complete:
        setModalVisible('success')
    }
  }

  const handleCodeScan = async (event: any) => {
    setModalVisible('inProgress')

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
    agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
    agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    return () => {
      agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
    }
  }, [])

  return (
    <View>
      <QRScanner handleCodeScan={handleCodeScan} />
      <Message
        visible={modalVisible === 'inProgress'}
        message="Pending Connection"
        icon="alarm"
        backgroundColor={backgroundColor}
      />
      <Message
        visible={modalVisible === 'success'}
        message="Connection Complete"
        icon="check-circle"
        backgroundColor={mainColor}
        continueButton
        onPress={() => setModalVisible('')}
      />
      <Message
        visible={modalVisible === 'failure'}
        message="Connection Failed. Please try again."
        icon="cancel"
        backgroundColor="#de3333"
        continueButton
        onPress={() => setModalVisible('')}
      />
    </View>
  )
}
export default Scan
