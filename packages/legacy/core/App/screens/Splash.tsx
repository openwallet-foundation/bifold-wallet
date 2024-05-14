import { Agent, HttpOutboundTransport, WsOutboundTransport } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { agentDependencies } from '@credo-ts/react-native'
import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { Config } from 'react-native-config'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { TOKENS, useContainer } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { Screens, Stacks } from '../types/navigators'
import { Onboarding as StoreOnboardingState } from '../types/state'
import { getAgentModules, createLinkSecretIfRequired } from '../utils/agent'
import { migrateToAskar, didMigrateToAskar } from '../utils/migration'

const OnboardingVersion = 1

const onboardingComplete = (state: StoreOnboardingState): boolean => {
  return (
    (state.onboardingVersion !== 0 && state.didCompleteOnboarding) ||
    (state.onboardingVersion === 0 && state.didConsiderBiometry)
  )
}

const resumeOnboardingAt = (
  state: StoreOnboardingState,
  params: { enableWalletNaming?: boolean; showPreface?: boolean; termsVersion?: boolean | string }
): Screens => {
  const termsVer = params.termsVersion ?? true
  if (
    (state.didSeePreface || !params.showPreface) &&
    state.didCompleteTutorial &&
    state.didAgreeToTerms === termsVer &&
    state.didCreatePIN &&
    (state.didNameWallet || !params.enableWalletNaming) &&
    !state.didConsiderBiometry
  ) {
    return Screens.UseBiometry
  }

  if (
    (state.didSeePreface || !params.showPreface) &&
    state.didCompleteTutorial &&
    state.didAgreeToTerms === termsVer &&
    state.didCreatePIN &&
    params.enableWalletNaming &&
    !state.didNameWallet
  ) {
    return Screens.NameWallet
  }

  if (
    (state.didSeePreface || !params.showPreface) &&
    state.didCompleteTutorial &&
    state.didAgreeToTerms === termsVer &&
    !state.didCreatePIN
  ) {
    return Screens.CreatePIN
  }

  if ((state.didSeePreface || !params.showPreface) && state.didCompleteTutorial && state.didAgreeToTerms !== termsVer) {
    return Screens.Terms
  }

  if (state.didSeePreface || !params.showPreface) {
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
  const { showPreface, enablePushNotifications } = useConfiguration()
  const { setAgent } = useAgent()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  const { getWalletCredentials } = useAuth()
  const { ColorPallet } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
  const container = useContainer()
  const [mounted, setMounted] = useState(false)
  const { version: TermsVersion } = container.resolve(TOKENS.SCREEN_TERMS)
  const logger = container.resolve(TOKENS.UTIL_LOGGER)
  const indyLedgers = container.resolve(TOKENS.UTIL_LEDGERS)
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
    if (!mounted || store.authentication.didAuthenticate) {
      return
    }

    const initOnboarding = async (): Promise<void> => {
      try {
        // load authentication attempts from storage
        if (!store.stateLoaded) {
          return
        }

        if (store.onboarding.onboardingVersion !== OnboardingVersion) {
          dispatch({ type: DispatchAction.ONBOARDING_VERSION, payload: [OnboardingVersion] })
        }

        if (onboardingComplete(store.onboarding)) {
          if (store.onboarding.onboardingVersion !== OnboardingVersion) {
            dispatch({ type: DispatchAction.ONBOARDING_VERSION, payload: [OnboardingVersion] })
          }
          // if they previously completed onboarding before wallet naming was enabled, mark complete
          if (!store.onboarding.didNameWallet) {
            dispatch({ type: DispatchAction.DID_NAME_WALLET, payload: [true] })
          }

          // if they previously completed onboarding before preface was enabled, mark seen
          if (!store.onboarding.didSeePreface) {
            dispatch({ type: DispatchAction.DID_SEE_PREFACE })
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
        } else {
          // If onboarding was interrupted we need to pickup from where we left off.
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: resumeOnboardingAt(store.onboarding, {
                    enableWalletNaming: store.preferences.enableWalletNaming,
                    showPreface,
                    termsVersion: TermsVersion,
                  }),
                },
              ],
            })
          )
        }
      } catch (err: unknown) {
        const error = new BifoldError(
          t('Error.Title1044'),
          t('Error.Message1044'),
          (err as Error)?.message ?? err,
          1044
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    }

    initOnboarding()
  }, [mounted, store.authentication.didAuthenticate, store.stateLoaded])

  useEffect(() => {
    if (!mounted || !store.authentication.didAuthenticate || !store.onboarding.didConsiderBiometry) {
      return
    }

    const initAgent = async (): Promise<void> => {
      try {
        const credentials = await getWalletCredentials()

        if (!credentials?.id || !credentials.key) {
          // Cannot find wallet id/secret
          return
        }

        const newAgent = new Agent({
          config: {
            label: store.preferences.walletName || 'Aries Bifold',
            walletConfig: {
              id: credentials.id,
              key: credentials.key,
            },
            logger,
            autoUpdateStorageOnStartup: true,
          },
          dependencies: agentDependencies,
          modules: getAgentModules({
            indyNetworks: indyLedgers,
            mediatorInvitationUrl: Config.MEDIATOR_URL,
          }),
        })
        const wsTransport = new WsOutboundTransport()
        const httpTransport = new HttpOutboundTransport()

        newAgent.registerOutboundTransport(wsTransport)
        newAgent.registerOutboundTransport(httpTransport)

        // If we haven't migrated to Aries Askar yet, we need to do this before we initialize the agent.
        if (!didMigrateToAskar(store.migration)) {
          newAgent.config.logger.debug('Agent not updated to Aries Askar, updating...')

          await migrateToAskar(credentials.id, credentials.key, newAgent)

          newAgent.config.logger.debug('Successfully finished updating agent to Aries Askar')
          // Store that we migrated to askar.
          dispatch({
            type: DispatchAction.DID_MIGRATE_TO_ASKAR,
          })
        }

        await newAgent.initialize()

        await createLinkSecretIfRequired(newAgent)

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
      }
    }

    initAgent()
  }, [mounted, store.authentication.didAuthenticate, store.onboarding.didConsiderBiometry])

  return (
    <SafeAreaView style={styles.container}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default Splash
