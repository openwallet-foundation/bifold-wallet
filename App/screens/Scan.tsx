import type { BarCodeReadEvent } from 'react-native-camera'

import { ConnectionState } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

import { QRScanner, Pending, Success, Failure } from 'components'
// eslint-disable-next-line import/no-cycle
import { ScanStackParams } from 'navigators/ScanStack'

interface Props {
  navigation: StackNavigationProp<ScanStackParams, 'Scan'>
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

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    setModalVisible('pending')
    try {
      const connectionRecord = await agent?.connections.receiveInvitationFromUrl(event.data, {
        autoAcceptConnection: true,
      })
      if (!connectionRecord?.id) {
        throw new Error('Connection record ID not found')
      }
      setConnectionId(connectionRecord.id)
    } catch {
      setModalVisible('failure')
    }
  }

  const exitCodeScan = () => {
    setModalVisible('')
    navigation.goBack()
  }

  return (
    <View>
      <QRScanner handleCodeScan={handleCodeScan} />
      <Pending visible={modalVisible === 'pending'} />
      <Success visible={modalVisible === 'success'} onPress={exitCodeScan} />
      <Failure visible={modalVisible === 'failure'} onPress={exitCodeScan} />
    </View>
  )
}
export default Scan
