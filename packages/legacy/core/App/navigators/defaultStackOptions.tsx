import React from 'react'

import HeaderTitle from '../components/texts/HeaderTitle'
import { ITheme } from '../theme'

export function createDefaultStackOptions({ ColorPallet }: ITheme) {
  return {
    headerTintColor: ColorPallet.brand.headerIcon,
    headerShown: true,
    headerBackTitleVisible: false,
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
  }
}
