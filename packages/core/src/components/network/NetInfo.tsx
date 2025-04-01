import { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useNetwork } from '../../contexts/network'
import { ToastType } from '../toast/BaseToast'

const NetInfo: React.FC = () => {
  const { assertInternetReachable } = useNetwork()
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

  useEffect(() => {
    const internetReachable = assertInternetReachable()
    if (internetReachable) {
      Toast.hide()
    }

    // Strict check for false, null means the network state is not yet known
    if (internetReachable === false && !hasShown) {
      showNetworkWarning()
    }
  }, [showNetworkWarning, assertInternetReachable, hasShown])

  return null
}

export default NetInfo
