/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ParamListBase, RouteConfig, StackNavigationState, useNavigation } from '@react-navigation/core'
import { StackNavigationOptions, StackNavigationProp, createStackNavigator } from '@react-navigation/stack'
import { StackNavigationEventMap } from '@react-navigation/stack/lib/typescript/src/types'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TOKENS, useContainer } from '../container-api'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import AttemptLockout from '../screens/AttemptLockout'
import NameWallet from '../screens/NameWallet'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINEnter from '../screens/PINEnter'
import PushNotification from '../screens/PushNotification'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

type ScreenOptions = RouteConfig<
  ParamListBase,
  Screens,
  StackNavigationState<ParamListBase>,
  StackNavigationOptions,
  StackNavigationEventMap
>

const OnboardingStack: React.FC = () => {
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const container = useContainer()
  const Stack = createStackNavigator()
  const theme = useTheme()
  const OnboardingTheme = theme.OnboardingTheme
  const carousel = createCarouselStyle(OnboardingTheme)
  const Onboarding = container.resolve(TOKENS.SCREEN_ONBOARDING)
  const { pages, splash, useBiometry } = useConfiguration()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const onTutorialCompleted = container.resolve(TOKENS.FN_ONBOARDING_DONE)(dispatch, navigation)
  const { screen: Terms } = container.resolve(TOKENS.SCREEN_TERMS)
  const Developer = container.resolve(TOKENS.SCREEN_DEVELOPER)
  const ScreenOptionsDictionary = container.resolve(TOKENS.OBJECT_ONBOARDING_CONFIG)
  const Preface = container.resolve(TOKENS.SCREEN_PREFACE)

  const onAuthenticated = (status: boolean): void => {
    if (!status) {
      return
    }

    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
    })
  }

  const OnBoardingScreen = () => {
    return (
      <Onboarding
        nextButtonText={t('Global.Next')}
        previousButtonText={t('Global.Back')}
        disableSkip={true}
        pages={pages(onTutorialCompleted, OnboardingTheme)}
        style={carousel}
      />
    )
  }

  // these need to be in the children of the stack screen otherwise they will unmount/remount which resets the component state in memory and causes issues
  const CreatePINScreen = (props: any) => {
    return <PINCreate setAuthenticated={onAuthenticated} {...props} />
  }

  const EnterPINScreen = (props: any) => {
    return <PINEnter setAuthenticated={onAuthenticated} {...props} />
  }

  const screens: ScreenOptions[] = [
    {
      name: Screens.Preface,
      component: Preface,
      options: () => {
        return {
          ...ScreenOptionsDictionary[Screens.Preface],
          title: t('Screens.Preface'),
        }
      },
    },
    {
      name: Screens.Splash,
      component: splash,
      options: ScreenOptionsDictionary[Screens.Splash],
    },
    {
      name: Screens.Onboarding,
      children: OnBoardingScreen,
      options: () => {
        return {
          ...ScreenOptionsDictionary[Screens.Onboarding],
          title: t('Screens.Onboarding'),
        }
      },
    },
    {
      name: Screens.Terms,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.Terms],
        title: t('Screens.Terms'),
      }),
      component: Terms,
    },
    {
      name: Screens.CreatePIN,
      children: CreatePINScreen,
      initialParams: {},
      options: () => ({
        ...ScreenOptionsDictionary[Screens.CreatePIN],
        title: t('Screens.CreatePIN'),
      }),
    },
    {
      name: Screens.NameWallet,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.NameWallet],
        title: t('Screens.NameWallet'),
      }),
      component: NameWallet,
    },
    {
      name: Screens.UseBiometry,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.UseBiometry],
        title: t('Screens.Biometry'),
      }),
      component: useBiometry,
    },
    {
      name: Screens.UsePushNotifications,
      options: () => ({
        ...ScreenOptionsDictionary[Screens.UsePushNotifications],
        title: t('Screens.UsePushNotifications'),
      }),
      children: PushNotification as any,
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
      options: () => ({ headerShown: true, headerLeft: () => null }),
    },
  ]

  return (
    <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions }}>
      {screens.map((item) => {
        return <Stack.Screen key={item.name} {...item} />
      })}
    </Stack.Navigator>
  )
}

export default OnboardingStack
