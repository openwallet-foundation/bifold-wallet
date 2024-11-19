import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'
import { ToastType } from '../../components/toast/BaseToast'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertNetworkReachable } = useNetwork()
  const { t } = useTranslation()
  const [hasShown, setHasShown] = useState(false)

  const isConnected = silentAssertConnectedNetwork()
  useEffect(() => {
    // Network is connected
    if (isConnected) {
      // Assert that internet is available
      assertNetworkReachable().then((status) => {
        // Connected to a network, reset toast
        setHasShown(false)
        if (status) {
          return
        }

        // User is connected to a network but has no internet, display toast
        Toast.show({
          type: ToastType.Error,
          autoHide: true,
          text1: t('NetInfo.NoInternetConnectionTitle'),
        })
      })
      return
    }

    // Only show the toast if the user hasn't seen it already
    if (!hasShown) {
      setHasShown(true)
      Toast.show({
        type: ToastType.Error,
        autoHide: true,
        text1: t('NetInfo.NoInternetConnectionTitle'),
      })
    }
  }, [isConnected, assertNetworkReachable, t, hasShown])

  return null
}

export default NetInfo
