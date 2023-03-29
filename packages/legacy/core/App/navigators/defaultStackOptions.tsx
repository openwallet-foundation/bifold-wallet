import React from 'react'

import HeaderTitle from '../components/texts/HeaderTitle'
import { Theme } from '../theme'

export function createDefaultStackOptions({ ColorPallet }: Theme) {
  return {
    headerTintColor: ColorPallet.grayscale.white,
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
