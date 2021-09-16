import React, { useState } from 'react'
import { View } from 'react-native'
import { useAgent } from 'aries-hooks'

import { QRScanner, Pending, Success, Failure } from 'components'
import { useIsFocused } from '@react-navigation/core'

interface Props {
  navigation: any
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const { agent } = useAgent()
  const isFocused = useIsFocused()

  const [modalVisible, setModalVisible] = useState<'pending' | 'success' | 'failure' | ''>('')

  const handleCodeScan = async (event: any) => {
    setModalVisible('pending')
    try {
      await agent.connections.receiveInvitationFromUrl(event.data, {
        autoAcceptConnection: true,
      })
      setModalVisible('success')
    } catch (error) {
      setModalVisible('failure')
    }
  }

  return (
    <View>
      {isFocused && modalVisible === '' ? <QRScanner handleCodeScan={handleCodeScan} /> : undefined}
      <Pending visible={modalVisible === 'pending'} />
      <Success visible={modalVisible === 'success'} onPress={() => setModalVisible('')} />
      <Failure visible={modalVisible === 'failure'} onPress={() => setModalVisible('')} />
    </View>
  )
}
export default Scan
