import { StackNavigationOptions } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderTitle from '../components/texts/HeaderTitle'
import { useConfiguration } from '../contexts/configuration'
import { ITheme, OnboardingTheme } from '../theme'
import { ScreenOptionsType, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

export const DefaultScreenOptionsDictionary: ScreenOptionsType = {
  [Screens.Preface]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerLeft: () => false,
  },
  [Screens.Splash]: {
    headerShown: false,
  },
  [Screens.Onboarding]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    gestureEnabled: false,
    headerLeft: () => false,
  },
  [Screens.Terms]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerLeft: () => false,
  },
  [Screens.CreatePIN]: {
    headerLeft: () => false,
  },
  [Screens.NameWallet]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerLeft: () => false,
  },
  [Screens.UseBiometry]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerLeft: () => false,
  },
  [Screens.Developer]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerBackTestID: testIdWithKey('Back'),
  },
  [Screens.UsePushNotifications]: {
    headerTintColor: OnboardingTheme.headerTintColor,
    headerLeft: () => false,
  },
}

export function createDefaultStackOptions({ ColorPallet }: ITheme): StackNavigationOptions {
  const { t } = useTranslation()
  const { globalScreenOptions } = useConfiguration()

  return (
    globalScreenOptions ?? {
      headerTintColor: ColorPallet.brand.headerIcon,
      headerShown: true,
      headerBackTitleVisible: false,
      headerTitleContainerStyle: {
        flexShrink: 1,
        maxWidth: '68%',
        width: '100%',
      },
      headerStyle: {
        elevation: 0,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 6,
        shadowColor: ColorPallet.grayscale.black,
        shadowOpacity: 0.15,
        borderBottomWidth: 0,
      },
      headerTitleAlign: 'center' as 'center' | 'left',
      headerTitle: (props: { children: React.ReactNode }) => <HeaderTitle {...props} />,
      headerBackAccessibilityLabel: t('Global.Back'),
    }
  )
}
