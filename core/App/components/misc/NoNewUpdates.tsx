import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'
import InfoTextBox from '../texts/InfoTextBox'

const NoNewUpdates: React.FC = () => {
  const { t } = useTranslation()
  const { HomeTheme } = useThemeContext()

  return (
    <InfoTextBox>
      <Text style={HomeTheme.noNewUpdatesText} testID={testIdWithKey('NoNewUpdates')}>
        {t('Home.NoNewUpdates')}
      </Text>
    </InfoTextBox>
  )
}

export default NoNewUpdates
