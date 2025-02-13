import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import IconButton, { ButtonLocation } from './IconButton'
import { useTour } from '../../contexts/tour/tour-context'
import { ImportantForAccessibility } from '../../types/accessibility'

const SettingsMenu: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  const { currentStep } = useTour()
  const [hideElements, setHideElements] = useState<ImportantForAccessibility>('auto')

  useEffect(() => {
    setHideElements(currentStep === undefined ? 'auto' : 'no-hide-descendants')
  }, [currentStep])

  return (
    <IconButton
      buttonLocation={ButtonLocation.Left}
      accessibilityLabel={t('Screens.Settings')}
      importantForAccessibility={hideElements}
      testID={testIdWithKey('Settings')}
      onPress={() => navigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })}
      icon="menu"
    />
  )
}

export default SettingsMenu
