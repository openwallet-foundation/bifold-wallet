/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ParamListBase, RouteConfig, StackNavigationState, useNavigation } from '@react-navigation/core'
import {
  StackNavigationOptions,
  StackNavigationProp,
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack'
import { StackNavigationEventMap } from '@react-navigation/stack/lib/typescript/src/types'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TOKENS, useContainer } from '../container-api'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import NameWallet from '../screens/NameWallet'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

interface CreatePINScreenParams extends StackScreenProps<ParamListBase, Screens.CreatePIN> {}

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
  const { pages, splash, useBiometry, preface } = useConfiguration()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const onTutorialCompleted = container.resolve(TOKENS.FN_ONBOARDING_DONE)(dispatch, navigation)
  const terms = container.resolve(TOKENS.SCREEN_TERMS)
  const screenOptionsDictionary = container.resolve(TOKENS.OBJECT_ONBOARDINGCONFIG)
  const onAuthenticated = (status: boolean): void => {
    if (!status) {
      return
    }

    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
    })
  }
  const OnBoardingScreen: React.FC = () => {
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

  const CreatePINScreen: React.FC<CreatePINScreenParams> = (props) => {
    return <PINCreate setAuthenticated={onAuthenticated} {...props} />
  }

  const screens: ScreenOptions[] = [
    {
      name: Screens.Preface,
      component: preface,
      options: screenOptionsDictionary[Screens.Preface],
    },
    {
      name: Screens.Splash,
      component: splash,
      options: screenOptionsDictionary[Screens.Splash],
    },
    {
      name: Screens.Onboarding,
      component: OnBoardingScreen,
      options: () => {
        return {
          ...screenOptionsDictionary[Screens.Onboarding],
          title: t('Screens.Onboarding'),
        }
      },
    },
    {
      name: Screens.Terms,
      options: () => ({
        ...screenOptionsDictionary[Screens.Terms],
        title: t('Screens.Terms'),
      }),
      component: terms,
    },
    {
      name: Screens.CreatePIN,
      component: CreatePINScreen,
      initialParams: {},
      options: () => ({
        ...screenOptionsDictionary[Screens.CreatePIN],
        title: t('Screens.CreatePIN'),
      }),
    },
    {
      name: Screens.NameWallet,
      options: () => ({
        ...screenOptionsDictionary[Screens.CreatePIN],
        title: t('Screens.NameWallet'),
      }),
      component: NameWallet,
    },
    {
      name: Screens.UseBiometry,
      options: () => ({
        ...screenOptionsDictionary[Screens.CreatePIN],
        title: t('Screens.Biometry'),
      }),
      component: useBiometry,
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
