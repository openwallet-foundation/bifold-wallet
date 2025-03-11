/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  StackActions,
  ParamListBase,
  RouteConfig,
  StackNavigationState,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native'
import {
  TransitionPresets,
  StackNavigationOptions,
  StackNavigationProp,
  createStackNavigator,
} from '@react-navigation/stack'
import { EventTypes } from '../constants'
import { StackNavigationEventMap } from '@react-navigation/stack/lib/typescript/src/types'
import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import AttemptLockout from '../screens/AttemptLockout'
import NameWallet from '../screens/NameWallet'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINEnter from '../screens/PINEnter'
import PushNotification from '../screens/PushNotification'
// import UpdateAvailable from '../screens/UpdateAvailable'
import { AuthenticateStackParams, Screens, OnboardingTask } from '../types/navigators'
import { State } from '../types/state'
import { Config } from '../types/config'

import { useDefaultStackOptions } from './defaultStackOptions'
import { DeviceEventEmitter } from 'react-native'
import { getOnboardingScreens } from './OnboardingScreens'

type ScreenOptions = RouteConfig<
  ParamListBase,
  Screens,
  StackNavigationState<ParamListBase>,
  StackNavigationOptions,
  StackNavigationEventMap
>

const OnboardingStack: React.FC = () => {
  const [store, dispatch] = useStore<State>()
  const { t } = useTranslation()
  const Stack = createStackNavigator()
  const theme = useTheme()
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)
  const [
    config,
    splash,
    pages,
    useBiometry,
    Onboarding,
    Developer,
    { screen: Terms, version: termsVersion },
    onTutorialCompletedCurried,
    ScreenOptionsDictionary,
    Preface,
    generateOnboardingWorkflowSteps,
  ] = useServices([
    TOKENS.CONFIG,
    TOKENS.SCREEN_SPLASH,
    TOKENS.SCREEN_ONBOARDING_PAGES,
    TOKENS.SCREEN_USE_BIOMETRY,
    TOKENS.SCREEN_ONBOARDING,
    TOKENS.SCREEN_DEVELOPER,
    TOKENS.SCREEN_TERMS,
    TOKENS.FN_ONBOARDING_DONE,
    TOKENS.OBJECT_SCREEN_CONFIG,
    TOKENS.SCREEN_PREFACE,
    TOKENS.ONBOARDING,
  ])
  const defaultStackOptions = useDefaultStackOptions(theme)
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const onTutorialCompleted = onTutorialCompletedCurried(dispatch, navigation)
  const [localState, setLocalState] = useState<Array<OnboardingTask>>([])
  const currentRoute = useNavigationState((state) => state?.routes[state?.index])
  const { disableOnboardingSkip } = config as Config

  const onAuthenticated = useCallback(
    (status: boolean): void => {
      if (!status) {
        return
      }

      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
      })
    },
    [dispatch]
  )

  const OnBoardingScreen = () => {
    return (
      <Onboarding
        nextButtonText={t('Global.Next')}
        previousButtonText={t('Global.Back')}
        disableSkip={disableOnboardingSkip}
        pages={pages(onTutorialCompleted, OnboardingTheme)}
        style={carousel}
      />
    )
  }

  // These need to be in the children of the stack screen otherwise they
  // will unmount/remount which resets the component state in memory and causes
  // issues
  const CreatePINScreen = (props: any) => {
    return <PINCreate setAuthenticated={onAuthenticated} {...props} />
  }

  const EnterPINScreen = (props: any) => {
    return <PINEnter setAuthenticated={onAuthenticated} {...props} />
  }

  const activeScreen = useMemo(() => {
    return localState.find((s) => !s.completed)?.name
  }, [localState])

  useEffect(() => {
    if (!store.stateLoaded) {
      return
    }

    const screens = generateOnboardingWorkflowSteps(store, config, termsVersion)
    setLocalState(screens)
  }, [store.stateLoaded, store.onboarding, store.authentication, setLocalState, generateOnboardingWorkflowSteps])

  useEffect(() => {
    if (!store.stateLoaded) {
      return
    }

    // If the active screen is the same as the current route, then we don't
    // need to do anything.
    if (activeScreen && activeScreen === currentRoute?.name) {
      return
    }

    // If the active screen is different from the current route, then we need
    // to navigate to the active screen.
    if (activeScreen) {
      navigation.dispatch(StackActions.replace(activeScreen))
      return
    }

    // TODO:(jl) Should we remove onboarding complete form state?
    //    dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
    // TODO:(jl) We can remove this from permanent state as it is now
    // more of a transient state (think of it like an update).
    // TODO:(jl) Do we need to remove store.onboarding.postAuthScreens?

    // Nothing to do here, we are done with onboarding.
    DeviceEventEmitter.emit(EventTypes.DID_COMPLETE_ONBOARDING)
  }, [store.loaded, localState, navigation])

  const screens = useMemo(
    () =>
      getOnboardingScreens(t, ScreenOptionsDictionary, {
        Preface,
        Terms,
        NameWallet,
        useBiometry,
        PushNotification,
        Developer,
        AttemptLockout,
        OnBoardingScreen,
        CreatePINScreen,
        EnterPINScreen,
      }),
    [t, ScreenOptionsDictionary]
  )
  return (
    <Stack.Navigator
      initialRouteName={Screens.Preface}
      screenOptions={{
        ...defaultStackOptions,
      }}
    >
      {screens.map((item) => {
        return <Stack.Screen key={item.name} {...item} />
      })}
    </Stack.Navigator>
  )
}

export default OnboardingStack
