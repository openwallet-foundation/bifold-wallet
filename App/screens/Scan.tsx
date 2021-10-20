import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'

import { QRScanner, Pending, Success, Failure } from 'components'
import { ConnectionState } from '@aries-framework/core'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const { agent } = useAgent()

  const [modalVisible, setModalVisible] = useState<'pending' | 'success' | 'failure' | ''>('')

  const [connectionId, setConnectionId] = useState('')
  const connection = useConnectionById(connectionId)

  useEffect(() => {
    if (connection?.state === ConnectionState.Complete) {
      setModalVisible('success')
    }
  }, [connection])

  const handleCodeScan = async (event: any) => {
    setModalVisible('pending')
    try {
      const connectionRecord = await agent?.connections.receiveInvitationFromUrl(event.data, {
        autoAcceptConnection: true,
      })

      setConnectionId(connectionRecord.id)
    } catch {
      setModalVisible('failure')
    }
  }

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
