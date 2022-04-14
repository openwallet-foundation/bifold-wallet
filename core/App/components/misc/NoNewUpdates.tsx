import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { TextTheme } from '../../theme'
import { testIdWithKey } from '../../utils/testable'
import InfoTextBox from '../texts/InfoTextBox'

const NoNewUpdates: React.FC = () => {
  const { t } = useTranslation()

  return (
    <InfoTextBox>
      <Text style={TextTheme.normal} testID={testIdWithKey('NoNewUpdates')}>
        {t('Home.NoNewUpdates')}
      </Text>
    </InfoTextBox>
  )
}

export default NoNewUpdates
