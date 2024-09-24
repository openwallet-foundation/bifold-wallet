import { useEffect } from 'react'
import { Linking } from 'react-native'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { TOKENS, useServices } from '../container-api'

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
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL()
      logger.info(`initialUrl from sleep: ${initialUrl}`)
      if (initialUrl) {
        dispatch({
          type: DispatchAction.ACTIVE_DEEP_LINK,
          payload: [await assertDeepLinkSupported(initialUrl)],
        })
      }
    }
    getUrlAsync()
  }, [logger, dispatch])

  useEffect(() => {
    Linking.addEventListener('url', async ({ url }) => {
      logger.info(`initialUrl from background: ${url}`)
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
