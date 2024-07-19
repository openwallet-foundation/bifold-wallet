import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Screens, TabStacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import HeaderButton, { ButtonLocation } from './HeaderButton'

const HeaderRightHome: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  return (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Global.Home')}
      testID={testIdWithKey('HomeButton')}
      onPress={() => navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })}
      icon="home"
    />
  )
}

export default HeaderRightHome
