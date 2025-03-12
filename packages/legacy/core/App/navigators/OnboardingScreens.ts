import { TFunction } from 'i18next'
import { TransitionPresets, StackNavigationOptions, StackScreenProps } from '@react-navigation/stack'
import { ParamListBase, RouteConfig, StackNavigationState } from '@react-navigation/native'
import { Screens, ScreenOptionsType } from '../types/navigators'
import type { StackNavigationEventMap } from '@react-navigation/stack/lib/typescript/src/types'

type ScreenOptions = RouteConfig<
  ParamListBase,
  Screens,
  StackNavigationState<ParamListBase>,
  StackNavigationOptions,
  StackNavigationEventMap
>

interface ScreenComponents {
  Splash: React.FC<StackScreenProps<ParamListBase>>
  Preface: React.FC<StackScreenProps<ParamListBase>>
  Terms: React.FC<StackScreenProps<ParamListBase>>
  NameWallet: React.FC<StackScreenProps<ParamListBase>>
  useBiometry: React.FC<StackScreenProps<ParamListBase>>
  PushNotification: React.FC<StackScreenProps<ParamListBase, Screens.UsePushNotifications>>
  Developer: React.FC<StackScreenProps<ParamListBase>>
  AttemptLockout: React.FC<StackScreenProps<ParamListBase>>
  OnBoardingScreen: React.FC
  CreatePINScreen: React.FC
  EnterPINScreen: React.FC
}

export const getOnboardingScreens = (
  t: TFunction,
  ScreenOptionsDictionary: ScreenOptionsType,
  components: ScreenComponents
): ScreenOptions[] => [
  {
    name: Screens.Splash,
    component: components.Splash,
    options: {
      ...ScreenOptionsDictionary[Screens.Splash],
      ...TransitionPresets.ModalFadeTransition,
      title: t('Screens.Splash'),
    },
  },
  {
    name: Screens.Preface,
    component: components.Preface,
    options: {
      ...ScreenOptionsDictionary[Screens.Preface],
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Preface'),
    },
  },
  {
    name: Screens.Onboarding,
    children: components.OnBoardingScreen,
    options: () => ({
      ...ScreenOptionsDictionary[Screens.Onboarding],
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Onboarding'),
      headerLeft: () => false,
    }),
  },
  {
    name: Screens.Terms,
    options: () => ({
      ...ScreenOptionsDictionary[Screens.Terms],
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Terms'),
      headerLeft: () => false,
    }),
    component: components.Terms,
  },
  {
    name: Screens.CreatePIN,
    children: components.CreatePINScreen,
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
    component: components.NameWallet,
  },
  {
    name: Screens.UseBiometry,
    options: () => ({
      ...ScreenOptionsDictionary[Screens.UseBiometry],
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Biometry'),
      headerLeft: () => false,
    }),
    component: components.useBiometry,
  },
  {
    name: Screens.UsePushNotifications,
    component: components.PushNotification,
    options: () => ({
      ...ScreenOptionsDictionary[Screens.UsePushNotifications],
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.UsePushNotifications'),
      headerLeft: () => false,
    }),
  },
  {
    name: Screens.Developer,
    component: components.Developer,
    options: () => ({
      ...ScreenOptionsDictionary[Screens.Developer],
      title: t('Screens.Developer'),
      headerBackAccessibilityLabel: t('Global.Back'),
    }),
  },
  {
    name: Screens.EnterPIN,
    children: components.EnterPINScreen,
    options: () => ({
      title: t('Screens.EnterPIN'),
      headerShown: true,
      headerLeft: () => false,
      rightLeft: () => false,
    }),
  },
  {
    name: Screens.AttemptLockout,
    component: components.AttemptLockout,
    options: () => ({
      headerShown: true,
      headerLeft: () => null,
      title: t('Screens.AttemptLockout'),
    }),
  },
]
