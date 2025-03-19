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
  OnboardingScreen: React.FC
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
      ...TransitionPresets.ModalFadeTransition,
      title: t('Screens.Splash'),
      ...ScreenOptionsDictionary[Screens.Splash],
    },
  },
  {
    name: Screens.Preface,
    component: components.Preface,
    options: {
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Preface'),
      ...ScreenOptionsDictionary[Screens.Preface],
    },
  },
  {
    name: Screens.Onboarding,
    children: components.OnboardingScreen,
    options: () => ({
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Onboarding'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.Onboarding],
    }),
  },
  {
    name: Screens.Terms,
    options: () => ({
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Terms'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.Terms],
    }),
    component: components.Terms,
  },
  {
    name: Screens.CreatePIN,
    children: components.CreatePINScreen,
    initialParams: {},
    options: () => ({
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.CreatePIN'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.CreatePIN],
    }),
  },
  {
    name: Screens.NameWallet,
    options: () => ({
      title: t('Screens.NameWallet'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.NameWallet],
    }),
    component: components.NameWallet,
  },
  {
    name: Screens.UseBiometry,
    options: () => ({
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.Biometry'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.UseBiometry],
    }),
    component: components.useBiometry,
  },
  {
    name: Screens.UsePushNotifications,
    component: components.PushNotification,
    options: () => ({
      ...TransitionPresets.SlideFromRightIOS,
      title: t('Screens.UsePushNotifications'),
      headerLeft: () => false,
      ...ScreenOptionsDictionary[Screens.UsePushNotifications],
    }),
  },
  {
    name: Screens.Developer,
    component: components.Developer,
    options: () => ({
      title: t('Screens.Developer'),
      headerBackAccessibilityLabel: t('Global.Back'),
      ...ScreenOptionsDictionary[Screens.Developer],
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
      ...ScreenOptionsDictionary[Screens.EnterPIN],
    }),
  },
  {
    name: Screens.AttemptLockout,
    component: components.AttemptLockout,
    options: () => ({
      headerShown: true,
      headerLeft: () => null,
      title: t('Screens.AttemptLockout'),
      ...ScreenOptionsDictionary[Screens.AttemptLockout],
    }),
  },
]
