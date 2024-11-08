import { RemoteOCABundleResolver } from '@hyperledger/aries-oca/build/legacy'
import { useNavigation, CommonActions } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import useInitializeAgent from '../hooks/initialize-agent'
import { BifoldError } from '../types/error'
import { Screens, Stacks } from '../types/navigators'

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
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  const { ColorPallet } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
  const [mounted, setMounted] = useState(false)
  const initializing = useRef(false)
  const { initializeAgent } = useInitializeAgent()
  const [
    { version: TermsVersion },
    logger,
    { showPreface, enablePushNotifications },
    ocaBundleResolver,
    historyEnabled,
  ] = useServices([
    TOKENS.SCREEN_TERMS,
    TOKENS.UTIL_LOGGER,
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
    const initAgentAsyncEffect = async (): Promise<void> => {
      try {
        if (
          !mounted ||
          initializing.current ||
          !store.authentication.didAuthenticate ||
          !store.onboarding.didConsiderBiometry
        ) {
          return
        }

        initializing.current = true

        await (ocaBundleResolver as RemoteOCABundleResolver).checkForUpdates?.()

        const newAgent = await initializeAgent()

        if (!newAgent) {
          initializing.current = false
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
  }, [
    initializeAgent,
    mounted,
    store.authentication.didAuthenticate,
    store.onboarding.didConsiderBiometry,
    store.onboarding.postAuthScreens.length,
    ocaBundleResolver,
    logger,
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
