import * as React from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertNetworkReachable } = useNetwork()
  const { t } = useTranslation()

  const isConnected = silentAssertConnectedNetwork()

  useEffect(() => {
    if (isConnected) {
      assertNetworkReachable().then((status) => {
        if (status) {
          return
        }

        Toast.show({
          type: 'warn',
          autoHide: false,
          text1: t('NetInfo.NoInternetConnectionMessage'),
        })
      })

      return
    }

    Toast.show({
      type: 'error',
      autoHide: true,
      text1: t('NetInfo.NoInternetConnectionTitle'),
    })
  }, [isConnected, assertNetworkReachable, t])

  return null
}

export default NetInfo
