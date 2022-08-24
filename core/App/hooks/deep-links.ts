import { useAgent } from '@aries-framework/react-hooks'
import { useEffect, useState } from 'react'
import { Linking } from 'react-native'

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
  const [deepLink, setDeepLink] = useState<string>('')

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        setDeepLink(await assertDeepLinkSupported(initialUrl))
      }
    }
    getUrlAsync()
  }, [])

  useEffect(() => {
    Linking.addEventListener('url', async ({ url }) => {
      if (url) {
        setDeepLink(await assertDeepLinkSupported(url))
      }
    })

    return () => {
      Linking.removeAllListeners('url')
    }
  })

  return deepLink
}
