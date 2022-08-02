import { NetInfoStateType, useNetInfo } from '@react-native-community/netinfo'
import * as React from 'react'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

import NetInfoModal from '../../components/modals/NetInfoModal'

const NetInfo: React.FC = () => {
  const netInfo = useNetInfo()
  const [isNetInfoModalDisplayed, setIsNetInfoModalDisplayed] = useState<boolean>(false)

  useEffect(() => {
    if (!netInfo.isConnected && netInfo.type === NetInfoStateType.none) {
      Toast.show({
        type: 'error',
        autoHide: false,
        onPress: () => {
          Toast.hide()
          setIsNetInfoModalDisplayed(true)
        },
      })
    }
  }, [netInfo.isConnected])

  return <NetInfoModal visible={isNetInfoModalDisplayed} onSubmit={() => setIsNetInfoModalDisplayed(false)} />
}

export default NetInfo
