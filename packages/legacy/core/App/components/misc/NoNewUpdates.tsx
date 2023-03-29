import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import InfoTextBox from '../texts/InfoTextBox'

const NoNewUpdates: React.FC = () => {
  const { t } = useTranslation()
  const { HomeTheme } = useTheme()

  return (
    <InfoTextBox>
      <Text style={[HomeTheme.noNewUpdatesText, { flexShrink: 1 }]} testID={testIdWithKey('NoNewUpdates')}>
        {t('Home.NoNewUpdates')}
      </Text>
    </InfoTextBox>
  )
}

export default NoNewUpdates
