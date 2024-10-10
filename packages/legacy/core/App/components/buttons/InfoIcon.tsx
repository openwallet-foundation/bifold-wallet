import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

import IconButton, { ButtonLocation } from './IconButton'

interface InfoIconProps {
  connectionId: string
}

const InfoIcon: React.FC<InfoIconProps> = ({ connectionId }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  return (
    <IconButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Screens.Settings')}
      testID={testIdWithKey('Settings')}
      onPress={() =>
        navigation.navigate(Stacks.ContactStack, {
          screen: Screens.ContactDetails,
          params: { connectionId: connectionId },
        })
      }
      icon="dots-vertical"
    />
  )
}

export default InfoIcon
