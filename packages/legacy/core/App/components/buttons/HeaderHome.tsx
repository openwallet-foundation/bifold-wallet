import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Screens, TabStacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import IconButton, { ButtonLocation } from './IconButton'
import { useTour } from '../../contexts/tour/tour-context'
import { ImportantForAccessibility } from '../../types/accessibility'

const HeaderRightHome: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { currentStep } = useTour()
  const [hideElements, setHideElements] = useState<ImportantForAccessibility>('auto')

  useEffect(() => {
    setHideElements(currentStep === undefined ? 'auto' : 'no-hide-descendants')
  }, [currentStep])

  return (
    <IconButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Global.Home')}
      importantForAccessibility={hideElements}
      testID={testIdWithKey('HomeButton')}
      onPress={() => navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })}
      icon="home"
    />
  )
}

export default HeaderRightHome
