import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { DeviceEventEmitter } from 'react-native'
import { NetworkEventTypes } from '../../types/network'
import { useNetwork } from '../../contexts/network'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertLedgerConnectivity } = useNetwork()
  const { t } = useTranslation()
  const isConnected = silentAssertConnectedNetwork()
  const [trigger, setTrigger] = useState(false) // used as a toggle

  useEffect(() => {
    if (isConnected) {
      assertLedgerConnectivity().then((status) => {
        if (typeof status === 'undefined' || status) {
          return
        }

        Toast.show({
          type: 'warn',
          autoHide: false,
          text1: t('NetInfo.LedgerConnectivityIssueMessage'),
        })
      })

      return
    }

    Toast.show({
      type: 'error',
      autoHide: true,
      text1: t('NetInfo.NoInternetConnectionTitle'),
    })
  }, [isConnected, assertLedgerConnectivity, t, trigger])

  useEffect(() => {
    const eventListener = DeviceEventEmitter.addListener(NetworkEventTypes.LedgerNodesUpdated, () => {
      setTrigger((prev) => !prev)
    })

    return () => {
      eventListener.remove()
    }
  }, [])

  return null
}

export default NetInfo
