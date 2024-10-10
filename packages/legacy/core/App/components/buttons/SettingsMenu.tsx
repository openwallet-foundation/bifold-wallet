import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import IconButton, { ButtonLocation } from './IconButton'

const SettingsMenu: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  return (
    <IconButton
      buttonLocation={ButtonLocation.Left}
      accessibilityLabel={t('Screens.Settings')}
      testID={testIdWithKey('Settings')}
      onPress={() => navigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })}
      icon="menu"
    />
  )
}

export default SettingsMenu
