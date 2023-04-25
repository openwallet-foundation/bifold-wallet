import * as React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'

import { useNetwork } from '../../contexts/network'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertLedgerConnectivity } = useNetwork()
  const { t } = useTranslation()

  const isConnected = silentAssertConnectedNetwork()

  useEffect(() => {
    if (isConnected) {
      assertLedgerConnectivity().then((status) => {
        if (status) {
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
  }, [isConnected])

  return null
}

export default NetInfo
