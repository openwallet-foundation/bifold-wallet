import { RemoteOCABundleResolver } from '@bifold/oca/build/legacy'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { WalletSecret } from '../types/security'
import { useAuth } from '../contexts/auth'
import { useStore } from '../contexts/store'

export type SplashProps = {
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
}

/**
 * This Splash screen is shown in two scenarios: initial load of the app,
 * and during agent initialization after login
 */
const Splash: React.FC<SplashProps> = ({ initializeAgent }) => {
  const { walletSecret } = useAuth()
  const { t } = useTranslation()
  const [store] = useStore()
  const { ColorPallet } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
  const initializing = useRef(false)
  const [logger, ocaBundleResolver] = useServices([TOKENS.UTIL_LOGGER, TOKENS.UTIL_OCA_RESOLVER])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  useEffect(() => {
    if (initializing.current || !store.authentication.didAuthenticate) {
      return
    }

    if (!walletSecret) {
      throw new Error('Wallet secret is missing')
    }
    
    initializing.current = true

    const initAgentAsyncEffect = async (): Promise<void> => {
      try {
        await (ocaBundleResolver as RemoteOCABundleResolver).checkForUpdates?.()

        await initializeAgent(walletSecret)
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1045'),
          t('Error.Message1045'),
          (err as Error)?.message ?? err,
          1045
        )

        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        logger.error((err as Error)?.message ?? err)
      }
    }

    initAgentAsyncEffect()
  }, [initializeAgent, ocaBundleResolver, logger, walletSecret, t, store.authentication.didAuthenticate])

  return (
    <SafeAreaView style={styles.container}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default Splash
