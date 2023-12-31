import { StackNavigationOptions } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderTitle from '../components/texts/HeaderTitle'
import { useConfiguration } from '../contexts/configuration'
import { ITheme } from '../theme'

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
