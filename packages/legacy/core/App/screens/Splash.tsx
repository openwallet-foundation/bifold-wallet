import { RemoteOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'
import { useNavigation, CommonActions } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useTheme } from '../contexts/theme'
import useInitializeAgent from '../hooks/initialize-agent'
import { BifoldError } from '../types/error'
import { Stacks } from '../types/navigators'

/**
 * To customize this splash screen set the background color of the
 * iOS and Android launch screen to match the background color of
 * of this view.
 */
const Splash: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { ColorPallet } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
  const { initializeAgent } = useInitializeAgent()
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
    const initAgentAsyncEffect = async (): Promise<void> => {
      try {
        await (ocaBundleResolver as RemoteOCABundleResolver).checkForUpdates?.()

        const agent = await initializeAgent()

        if (!agent) {
          return
        }

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: Stacks.TabStack }],
          })
        )
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
  }, [initializeAgent, ocaBundleResolver, logger, navigation, t])

  return (
    <SafeAreaView style={styles.container}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default Splash
