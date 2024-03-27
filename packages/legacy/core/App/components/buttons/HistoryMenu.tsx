import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import HeaderButton, { ButtonLocation } from './HeaderButton'

const HistoryMenu: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  return (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Screens.Settings')}
      testID={testIdWithKey('Settings')}
      onPress={() => navigation.navigate(Stacks.HistoryStack, { screen: Screens.HistoryPage })}
      icon="history"
    />
  )
}

export default HistoryMenu
