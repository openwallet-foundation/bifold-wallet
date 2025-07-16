import { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNetwork } from '../../contexts/network'
import { useStore } from '../../contexts/store'
import { DispatchAction } from '../../contexts/reducers/store'

const NetInfo: React.FC = () => {
  const { assertInternetReachable } = useNetwork()
  const { t } = useTranslation()
  const [hasShown, setHasShown] = useState(false)
  const [, dispatch] = useStore()
  const showNetworkWarning = useCallback(() => {
    setHasShown(true)
    dispatch({
      type: DispatchAction.BANNER_MESSAGES,
      payload: [
        {
          id: 'netinfo-no-internet',
          title: t('NetInfo.NoInternetConnectionTitle'),
          type: 'error',
          variant: 'detail',
          dismissible: false,
        },
        {
          id: 'test3',
          title: 'generic test of types info',
          type: 'info',
          variant: 'detail',
          dismissible: true,
        },
        {
          id: 'test',
          title: 'generic test of types warning',
          type: 'warning',
          variant: 'detail',
          dismissible: true,
        },
        {
          id: 'test2',
          title: 'generic test of types success',
          type: 'success',
          variant: 'detail',
          dismissible: true,
        },
      ],
    })
  }, [dispatch, t])

  useEffect(() => {
    const internetReachable = assertInternetReachable()
    if (internetReachable) {
      setHasShown(false)
      dispatch({
        type: DispatchAction.REMOVE_BANNER_MESSAGE,
        payload: ['netinfo-no-internet', 'test', 'test2', 'test3'],
      })
    }

    // Strict check for false, null means the network state is not yet known
    if (internetReachable === false && !hasShown) {
      showNetworkWarning()
    }
  }, [showNetworkWarning, assertInternetReachable, hasShown, dispatch])

  return null
}

export default NetInfo
