import { useEffect, useMemo, useState } from 'react'
import { Linking } from 'react-native'

import { useActivity } from '../contexts/activity'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'

export const useDeepLinks = () => {
  const [store, dispatch] = useStore()
  const { appStateStatus } = useActivity()
  const [stashedDeepLink, setStashedDeepLink] = useState('')
  const ready = useMemo(
    () => store.authentication.didAuthenticate && ['active', 'inactive'].includes(appStateStatus),
    [store.authentication.didAuthenticate, appStateStatus]
  )

  // deeplink cold start
  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        setStashedDeepLink(initialUrl)
      }
    }
    getUrlAsync()
  }, [])

  // deeplink while already open
  useEffect(() => {
    Linking.addEventListener('url', async ({ url }) => {
      if (url) {
        setStashedDeepLink(url)
      }
    })

    return () => {
      Linking.removeAllListeners('url')
    }
  })

  // activate stashed deeplink when ready
  useEffect(() => {
    if (stashedDeepLink && ready) {
      dispatch({
        type: DispatchAction.ACTIVE_DEEP_LINK,
        payload: [stashedDeepLink],
      })
      setStashedDeepLink('')
    }
  }, [ready, stashedDeepLink, dispatch])
}
