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
import { EventTypes as BifoldEventTypes } from '@hyperledger/aries-bifold-core'
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
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { DeviceEventEmitter } from 'react-native'

type ScreenOptions = RouteConfig<
  ParamListBase,
  Screens,
  StackNavigationState<ParamListBase>,
  StackNavigationOptions,
  StackNavigationEventMap
>

type OnboardingTask = {
  name: Screens
  completed: boolean
}

const OnboardingStack: React.FC = () => {
  const [store, dispatch] = useStore<BCState>()
  const { t } = useTranslation()
  const Stack = createStackNavigator()
  const theme = useTheme()
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)
  const [
    { disableOnboardingSkip },
    splash,
    pages,
    useBiometry,
    Onboarding,
    Developer,
    { screen: Terms },
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

    const screens = generateOnboardingWorkflowSteps(store.onboarding, store.authentication, 2)
    console.log('***** Setting local state:', screens)
    setLocalState(screens)
  }, [store.stateLoaded, store.onboarding, store.authentication, setLocalState, generateOnboardingWorkflowSteps])

  useEffect(() => {
    const completed = localState.find((s) => s.completed)
    if (!completed) {
      return
    }

    if (activeScreen && activeScreen === currentRoute?.name) {
      return
    }

    if (activeScreen) {
      navigation.dispatch(StackActions.replace(activeScreen))
      return
    }

    // TODO:(jl) Do we need to:
    //    dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
    // TODO:(jl) Do we want this event to emit only once?
    // TODO:(jl) We can remove this from permanent state as it is now
    // more of a transient state (think of it like an update).
    // TODO:(jl) Do we need to remove store.onboarding.postAuthScreens?
    console.log('***** Emitting OnBoardingComplete')
    DeviceEventEmitter.emit('OnBoardingComplete')
  }, [store, localState, navigation])

  const screens: ScreenOptions[] = [
    // {
    //   name: Screens.Splash,
    //   component: splash,
    //   options: { ...ScreenOptionsDictionary[Screens.Splash], ...TransitionPresets.SlideFromRightIOS },
    // },
    {
      name: Screens.Preface,
      component: Preface,
      options: {
        ...ScreenOptionsDictionary[Screens.Preface],
        ...TransitionPresets.SlideFromRightIOS,
        title: t('Screens.Preface'),
      },
    },
    {
      name: Screens.Onboarding,
      children: OnBoardingScreen,
      options: () => {
        return {
          ...ScreenOptionsDictionary[Screens.Onboarding],
          ...TransitionPresets.SlideFromRightIOS,
          title: t('Screens.Onboarding'),
          headerLeft: () => false,
        }
      },
    },
    {
      name: Screens.Terms,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.Terms],
        ...TransitionPresets.SlideFromRightIOS,
        title: t('Screens.Terms'),
        headerLeft: () => false,
      }),
      component: Terms,
    },
    {
      name: Screens.CreatePIN,
      children: CreatePINScreen,
      initialParams: {},
      options: () => ({
        ...ScreenOptionsDictionary[Screens.CreatePIN],
        ...TransitionPresets.SlideFromRightIOS,
        title: t('Screens.CreatePIN'),
        headerLeft: () => false,
      }),
    },
    {
      name: Screens.NameWallet,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.NameWallet],
        title: t('Screens.NameWallet'),
        headerLeft: () => false,
      }),
      component: NameWallet,
    },
    {
      name: Screens.UseBiometry,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.UseBiometry],
        ...TransitionPresets.SlideFromRightIOS,
        title: t('Screens.Biometry'),
        headerLeft: () => false,
      }),
      // TODO:(jl) This should be capitalized - no?
      component: useBiometry,
    },
    {
      name: Screens.UsePushNotifications,
      component: PushNotification,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.UsePushNotifications],
        ...TransitionPresets.SlideFromRightIOS,
        title: t('Screens.UsePushNotifications'),
        headerLeft: () => false,
      }),
      // children: PushNotification as any,
    },
    {
      name: Screens.Developer,
      component: Developer,
      options: () => {
        return {
          ...ScreenOptionsDictionary[Screens.Developer],
          title: t('Screens.Developer'),
          headerBackAccessibilityLabel: t('Global.Back'),
        }
      },
    },
    // {
    //   name: Screens.UpdateAvailable,
    //   component: UpdateAvailable,
    //   options: () => {
    //     return {
    //       title: t('Screens.EnterPIN'),
    //       headerShown: true,
    //       headerLeft: () => false,
    //       rightLeft: () => false,
    //     }
    //   },
    // },
    {
      name: Screens.EnterPIN,
      children: EnterPINScreen,
      options: () => {
        return {
          title: t('Screens.EnterPIN'),
          headerShown: true,
          headerLeft: () => false,
          rightLeft: () => false,
        }
      },
    },
    {
      name: Screens.AttemptLockout,
      component: AttemptLockout,
      options: () => ({ headerShown: true, headerLeft: () => null, title: t('Screens.AttemptLockout') }),
    },
  ]

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
