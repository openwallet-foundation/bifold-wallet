import React, { useState, useEffect, useContext } from 'react'
import { View } from 'react-native'
import { ConnectionEventType, ConnectionState } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'
import { decodeInvitationFromUrl } from 'aries-framework'

import { Message, QRScanner } from 'components'

import { backgroundColor, mainColor } from '../globalStyles'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [modalVisible, setModalVisible] = useState<'inProgress' | 'success' | 'failure' | ''>('')

  const handleConnectionStateChange = async (event: any) => {
    switch (event.connectionRecord.state) {
      case ConnectionState.Complete:
        setModalVisible('success')
        break
      default: 
        break
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
    if(!agentContext.loading) {
      agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
    }
    
    return () => {
      agentContext.agent.credentials.events.removeListener(ConnectionEventType.StateChanged, handleConnectionStateChange)
    }
  })

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
