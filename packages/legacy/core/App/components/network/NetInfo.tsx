import { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'
import { ToastType } from '../../components/toast/BaseToast'
import { TOKENS, useServices } from '../../container-api'

const NetInfo: React.FC = () => {
  const { silentAssertConnectedNetwork, assertInternetReachable, assertMediatorReachable } = useNetwork()
  const [{ disableMediatorCheck }] = useServices([TOKENS.CONFIG])
  const { t } = useTranslation()
  const [hasShown, setHasShown] = useState(false)

  const showNetworkWarning = useCallback(() => {
    setHasShown(true)
    Toast.show({
      type: ToastType.Error,
      autoHide: true,
      text1: t('NetInfo.NoInternetConnectionTitle'),
    })
  }, [t])

  // will be null until network state is known
  const isConnected = silentAssertConnectedNetwork()

  useEffect(() => {
    // Only check general internet connection if mediator check is disabled
    if (disableMediatorCheck) {
      const internetReachable = assertInternetReachable()
      if (internetReachable) {
        Toast.hide()
      }
      
      // Strict check for false, null means the network state is not yet known
      if (internetReachable === false) {
        showNetworkWarning()
      }
      return
    }

    // Network is checked and available
    if (isConnected) {
      assertMediatorReachable().then((mediatorReachable) => {
        if (mediatorReachable) {
          Toast.hide()
          return
        }
        
        // Network is available but cannot access mediator, display toast
        showNetworkWarning()
      })
      return
    }
    
    // Network is checked and not connected, so display toast if not already shown
    if (isConnected === false && !hasShown) {
      showNetworkWarning()
    }
  }, [
    showNetworkWarning,
    isConnected,
    disableMediatorCheck,
    assertInternetReachable,
    assertMediatorReachable,
    hasShown
  ])

  return null
}

export default NetInfo
