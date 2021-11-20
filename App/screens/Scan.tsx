import type { BarCodeReadEvent } from 'react-native-camera'

import { ConnectionState } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'

import { QRScanner } from 'components'
// eslint-disable-next-line import/no-cycle
import { TabStackParams } from 'navigators/TabStack'

interface Props {
  navigation: BottomTabNavigationProp<TabStackParams, 'ScanTab'>
}

const Scan: React.FC<Props> = ({ navigation }) => {
  const { agent } = useAgent()

  const [connectionId, setConnectionId] = useState('')
  const connection = useConnectionById(connectionId)
  const { t } = useTranslation()

  useEffect(() => {
    if (connection?.state === ConnectionState.Complete) {
      Toast.show({
        type: 'success',
        text1: t('Scan.SuccessfullyAcceptedConnection'),
      })
      navigation.navigate('HomeTab')
    }
  }, [connection])

  const handleCodeScan = async (event: BarCodeReadEvent) => {
    Toast.show({
      type: 'info',
      text1: t('Scan.AcceptingConnection'),
    })
    try {
      const connectionRecord = await agent?.connections.receiveInvitationFromUrl(event.data, {
        autoAcceptConnection: true,
      })
      if (!connectionRecord?.id) {
        Toast.show({
          type: 'error',
          text1: t('Scan.ConnectionRecordIdNotFound'),
        })
        throw new Error('Connection record ID not found')
      }
      setConnectionId(connectionRecord.id)
    } catch {
      Toast.show({
        type: 'error',
        text1: t('Global.Failure'),
      })
      navigation.navigate('HomeTab')
    }
  }

  return (
    <View>
      <QRScanner handleCodeScan={handleCodeScan} />
    </View>
  )
}
export default Scan
