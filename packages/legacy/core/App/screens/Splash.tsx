import { Agent, HttpOutboundTransport, WsOutboundTransport, WalletError } from '@credo-ts/core'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr/build/pool'
import { useAgent } from '@credo-ts/react-hooks'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useNavigation, CommonActions } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { Config } from 'react-native-config'
import { CachesDirectoryPath } from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, Stacks } from '../types/navigators'
import { getAgentModules, createLinkSecretIfRequired } from '../utils/agent'
import { migrateToAskar, didMigrateToAskar } from '../utils/migration'
import { RemoteOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'

const OnboardingVersion = 1

const onboardingComplete = (
  onboardingVersion: number,
  didCompleteOnboarding: boolean,
  didConsiderBiometry: boolean
): boolean => {
  return (onboardingVersion !== 0 && didCompleteOnboarding) || (onboardingVersion === 0 && didConsiderBiometry)
}

const resumeOnboardingAt = (
  didSeePreface: boolean,
  didCompleteTutorial: boolean,
  didAgreeToTerms: boolean | string,
  didCreatePIN: boolean,
  didNameWallet: boolean,
  didConsiderBiometry: boolean,
  termsVersion?: boolean | string,
  enableWalletNaming?: boolean,
  showPreface?: boolean
): Screens => {
  const termsVer = termsVersion ?? true
  if (
    (didSeePreface || !showPreface) &&
    didCompleteTutorial &&
    didAgreeToTerms === termsVer &&
    didCreatePIN &&
    (didNameWallet || !enableWalletNaming) &&
    !didConsiderBiometry
  ) {
    return Screens.UseBiometry
  }

  if (
    (didSeePreface || !showPreface) &&
    didCompleteTutorial &&
    didAgreeToTerms === termsVer &&
    didCreatePIN &&
    enableWalletNaming &&
    !didNameWallet
  ) {
    return Screens.NameWallet
  }

  if ((didSeePreface || !showPreface) && didCompleteTutorial && didAgreeToTerms === termsVer && !didCreatePIN) {
    return Screens.CreatePIN
  }

  if ((didSeePreface || !showPreface) && didCompleteTutorial && !didAgreeToTerms) {
    return Screens.Terms
  }

  if (didSeePreface || !showPreface) {
    return Screens.Onboarding
  }

  return Screens.Preface
}

/**
 * To customize this splash screen set the background color of the
 * iOS and Android launch screen to match the background color of
 * of this view.
 */
const Splash: React.FC = () => {
  const { agent, setAgent } = useAgent()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  const { walletSecret } = useAuth()
  const { ColorPallet } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
  const [mounted, setMounted] = useState(false)
  const [
    cacheSchemas,
    cacheCredDefs,
    { version: TermsVersion },
    logger,
    indyLedgers,
    { showPreface, enablePushNotifications },
    ocaBundleResolver,
    historyEnabled,
  ] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.SCREEN_TERMS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
    TOKENS.CONFIG,
    TOKENS.UTIL_OCA_RESOLVER,
    TOKENS.HISTORY_ENABLED,
  ])
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  // navigation calls that occur before the screen is fully mounted will fail
  // this useeffect prevents that race condition
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || store.authentication.didAuthenticate || !store.stateLoaded) {
      return
    }

    const initOnboarding = async (): Promise<void> => {
      try {
        if (store.onboarding.onboardingVersion !== OnboardingVersion) {
          dispatch({ type: DispatchAction.ONBOARDING_VERSION, payload: [OnboardingVersion] })
          return
        }

        if (
          !onboardingComplete(
            store.onboarding.onboardingVersion,
            store.onboarding.didCompleteOnboarding,
            store.onboarding.didConsiderBiometry
          )
        ) {
          // If onboarding was interrupted we need to pickup from where we left off.
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: resumeOnboardingAt(
                    store.onboarding.didSeePreface,
                    store.onboarding.didCompleteTutorial,
                    store.onboarding.didAgreeToTerms,
                    store.onboarding.didCreatePIN,
                    store.onboarding.didNameWallet,
                    store.onboarding.didConsiderBiometry,
                    TermsVersion,
                    store.preferences.enableWalletNaming,
                    showPreface
                  ),
                },
              ],
            })
          )
          return
        }

        if (store.onboarding.onboardingVersion !== OnboardingVersion) {
          dispatch({ type: DispatchAction.ONBOARDING_VERSION, payload: [OnboardingVersion] })
          return
        }

        // if they previously completed onboarding before wallet naming was enabled, mark complete
        if (!store.onboarding.didNameWallet) {
          dispatch({ type: DispatchAction.DID_NAME_WALLET, payload: [true] })
          return
        }

        // if they previously completed onboarding before preface was enabled, mark seen
        if (!store.onboarding.didSeePreface) {
          dispatch({ type: DispatchAction.DID_SEE_PREFACE })
          return
        }

        // add post authentication screens
        const postAuthScreens = []
        if (store.onboarding.didAgreeToTerms !== TermsVersion) {
          postAuthScreens.push(Screens.Terms)
        }
        if (!store.onboarding.didConsiderPushNotifications && enablePushNotifications) {
          postAuthScreens.push(Screens.UsePushNotifications)
        }
        dispatch({ type: DispatchAction.SET_POST_AUTH_SCREENS, payload: [postAuthScreens] })

        if (!store.loginAttempt.lockoutDate) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: Screens.EnterPIN }],
            })
          )
        } else {
          // return to lockout screen if lockout date is set
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: Screens.AttemptLockout }],
            })
          )
        }
        return
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1044'),
          t('Error.Message1044'),
          (err as Error)?.message ?? err,
          1044
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        logger.error((err as Error)?.message ?? err)
      }
    }

    initOnboarding()
  }, [
    mounted,
    store.authentication.didAuthenticate,
    store.stateLoaded,
    store.onboarding.onboardingVersion,
    store.onboarding.didCompleteOnboarding,
    store.onboarding.didSeePreface,
    store.onboarding.didCompleteTutorial,
    store.onboarding.didAgreeToTerms,
    store.onboarding.didCreatePIN,
    store.onboarding.didConsiderPushNotifications,
    store.onboarding.didNameWallet,
    store.onboarding.didConsiderBiometry,
    store.preferences.enableWalletNaming,
    enablePushNotifications,
    TermsVersion,
    showPreface,
    dispatch,
    store.loginAttempt.lockoutDate,
    navigation,
    t,
    logger,
  ])

  useEffect(() => {
    const initAgent = async (): Promise<void> => {
      try {
        if (
          !mounted ||
          !store.authentication.didAuthenticate ||
          !store.onboarding.didConsiderBiometry ||
          !walletSecret?.id ||
          !walletSecret.key
        ) {
          return
        }

        await (ocaBundleResolver as RemoteOCABundleResolver).checkForUpdates?.()

        if (agent) {
          logger.info('Agent already initialized, restarting...')

          try {
            await agent.wallet.open({
              id: walletSecret.id,
              key: walletSecret.key,
            })

            logger.info('Opened agent wallet')
          } catch (error: unknown) {
            // Credo does not use error codes but this will be in the
            // the error message if the wallet is already open.
            const catchPhrase = 'instance already opened'

            if (error instanceof WalletError && error.message.includes(catchPhrase)) {
              logger.warn('Wallet already open, nothing to do')
            } else {
              logger.error('Error opening existing wallet:', error as Error)

              throw new BifoldError(
                'Wallet Service',
                'There was a problem unlocking the wallet.',
                (error as Error).message,
                1047
              )
            }
          }

          await agent.mediationRecipient.initiateMessagePickup()

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: Stacks.TabStack }],
            })
          )

          return
        }

        logger.info('No agent initialized, creating a new one')

        const newAgent = new Agent({
          config: {
            label: store.preferences.walletName || 'Aries Bifold',
            walletConfig: {
              id: walletSecret.id,
              key: walletSecret.key,
            },
            logger,
            autoUpdateStorageOnStartup: true,
          },
          dependencies: agentDependencies,
          modules: getAgentModules({
            indyNetworks: indyLedgers,
            mediatorInvitationUrl: Config.MEDIATOR_URL,
            txnCache: {
              capacity: 1000,
              expiryOffsetMs: 1000 * 60 * 60 * 24 * 7,
              path: CachesDirectoryPath + '/txn-cache',
            },
          }),
        })
        const wsTransport = new WsOutboundTransport()
        const httpTransport = new HttpOutboundTransport()

        newAgent.registerOutboundTransport(wsTransport)
        newAgent.registerOutboundTransport(httpTransport)

        // If we haven't migrated to Aries Askar yet, we need to do this before we initialize the agent.
        if (!didMigrateToAskar(store.migration)) {
          newAgent.config.logger.debug('Agent not updated to Aries Askar, updating...')

          await migrateToAskar(walletSecret.id, walletSecret.key, newAgent)

          newAgent.config.logger.debug('Successfully finished updating agent to Aries Askar')
          // Store that we migrated to askar.
          dispatch({
            type: DispatchAction.DID_MIGRATE_TO_ASKAR,
          })
        }

        await newAgent.initialize()

        await createLinkSecretIfRequired(newAgent)

        const poolService = newAgent.dependencyManager.resolve(IndyVdrPoolService)
        cacheCredDefs.forEach(async ({ did, id }) => {
          const pool = await poolService.getPoolForDid(newAgent.context, did)
          const credDefRequest = new GetCredentialDefinitionRequest({ credentialDefinitionId: id })
          await pool.pool.submitRequest(credDefRequest)
        })

        cacheSchemas.forEach(async ({ did, id }) => {
          const pool = await poolService.getPoolForDid(newAgent.context, did)
          const schemaRequest = new GetSchemaRequest({ schemaId: id })
          await pool.pool.submitRequest(schemaRequest)
        })

        setAgent(newAgent)
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

    initAgent()
  }, [
    mounted,
    agent,
    store.authentication.didAuthenticate,
    store.onboarding.didConsiderBiometry,
    walletSecret,
    store.onboarding.postAuthScreens.length,
    ocaBundleResolver,
    indyLedgers,
    store.preferences.walletName,
    logger,
    store.migration,
    dispatch,
    cacheCredDefs,
    cacheSchemas,
    setAgent,
    store.preferences.usePushNotifications,
    navigation,
    t,
  ])

  useEffect(() => {
    if (!mounted || !historyEnabled) {
      return
    }
    dispatch({
      type: DispatchAction.HISTORY_CAPABILITY,
      payload: [true],
    })
  }, [mounted, historyEnabled, dispatch])

  return (
    <SafeAreaView style={styles.container}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default Splash
