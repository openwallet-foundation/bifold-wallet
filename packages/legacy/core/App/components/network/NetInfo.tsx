import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'
import { ToastType } from '../../components/toast/BaseToast'
import { TOKENS, useServices } from '../../container-api'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertNetworkReachable } = useNetwork()
  const [{ disableFirewallCheck }] = useServices([TOKENS.CONFIG])
  const { t } = useTranslation()
  const [hasShown, setHasShown] = useState(false)

  const isConnected = silentAssertConnectedNetwork()
  
  useEffect(() => {
    // Network is available, do further testing according to CFG.disableFirewallCheck
    if (isConnected) {
      if (disableFirewallCheck) {
        return
      } else {
        // Assert that internet is available by try connecting the socket of configured mediator
        assertNetworkReachable().then((status) => {
          // Connected to a network, reset toast
          setHasShown(false)
          if (status) {
            return
          }

          // User is connected to a network but has no internet, e.g. firewall problem, display the toast
          Toast.show({
            type: ToastType.Error,
            autoHide: true,
            text1: t('NetInfo.NoInternetConnectionTitle'),
          })
        })
        return
      }
    } else if (!hasShown) {
      // Only show the no-network toast if the user hasn't seen it before
      setHasShown(true)
      Toast.show({
        type: ToastType.Error,
        autoHide: true,
        text1: t('NetInfo.NoInternetConnectionTitle'),
      })
    }
  }, [isConnected, disableFirewallCheck, assertNetworkReachable, t, hasShown])

  return null
}

export default NetInfo
