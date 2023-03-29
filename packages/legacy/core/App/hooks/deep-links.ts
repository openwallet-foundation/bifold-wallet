import { useEffect } from 'react'
import { Linking } from 'react-native'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'

const assertDeepLinkSupported = async (deepLink: string) => {
  try {
    const supported = await Linking.canOpenURL(deepLink)
    if (!supported) {
      return ''
    }

    return deepLink
  } catch (error) {
    return ''
  }
}

export const useDeepLinks = () => {
  const [, dispatch] = useStore()

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        dispatch({
          type: DispatchAction.ACTIVE_DEEP_LINK,
          payload: [await assertDeepLinkSupported(initialUrl)],
        })
      }
    }
    getUrlAsync()
  }, [])

  useEffect(() => {
    Linking.addEventListener('url', async ({ url }) => {
      if (url) {
        dispatch({
          type: DispatchAction.ACTIVE_DEEP_LINK,
          payload: [await assertDeepLinkSupported(url)],
        })
      }
    })

    return () => {
      Linking.removeAllListeners('url')
    }
  })
}
