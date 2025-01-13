import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'
import { ToastType } from '../../components/toast/BaseToast'
import { TOKENS, useServices } from '../../container-api'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertInternetReachable, assertMediatorReachable } = useNetwork()
  const [{ disableFirewallCheck }] = useServices([TOKENS.CONFIG])
  const { t } = useTranslation()
  const [hasShown, setHasShown] = useState(false)

  const isInternetReachable = assertInternetReachable();
  const isConnected = silentAssertConnectedNetwork()
  
  useEffect(() => {
    // Network is available, do further testing according to CFG.disableFirewallCheck
    if (!disableFirewallCheck) {
      // Network is connected
      if (isConnected) {
        // Assert that internet is available
        assertMediatorReachable().then((status) => {
          // Connected to a network, reset toast
          setHasShown(false)
          if (status) {
            return
          }
  
          // User is connected to a network but has no internet, display toast
          Toast.show({
            type: ToastType.Error,
            autoHide: true,
            text1: t('NetInfo.NoInternetConnectionMessage'),
          })
        })
        return
      }
    } else if (isInternetReachable) {
      return
    }

    // Only show the toast if the user hasn't seen it already
    if (!hasShown) {
      setHasShown(true)
      Toast.show({
        type: ToastType.Error,
        autoHide: true,
        text1: t('NetInfo.NoInternetConnectionMessage'),
      })
    }

  }, [isConnected, isInternetReachable, disableFirewallCheck, assertInternetReachable, assertMediatorReachable, t, hasShown])

  return null
}

export default NetInfo
