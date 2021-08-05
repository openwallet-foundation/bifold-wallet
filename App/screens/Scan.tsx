import React, { useState, useEffect, useContext } from 'react'
import { View } from 'react-native'
import { ConnectionEventType, ConnectionState } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'
import { decodeInvitationFromUrl } from 'aries-framework'

import { Message, QRScanner, Pending, Success, Failure } from 'components'

import { backgroundColor, mainColor } from '../globalStyles'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [modalVisible, setModalVisible] = useState<'pending' | 'success' | 'failure' | ''>('')

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
    setModalVisible('pending')

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
      agentContext.agent.connections.events.on(ConnectionEventType.StateChanged, handleConnectionStateChange)
    }

    return () => {
      agentContext.agent.credentials.events.removeListener(
        ConnectionEventType.StateChanged,
        handleConnectionStateChange
      )
    }
  })

  return (
    <View>
      <QRScanner handleCodeScan={handleCodeScan} />
      <Pending visible={modalVisible === 'pending'} />
      <Success visible={modalVisible === 'success'} onPress={() => setModalVisible('')} />
      <Failure visible={modalVisible === 'failure'} onPress={() => setModalVisible('')} />
    </View>
  )
}
export default Scan
