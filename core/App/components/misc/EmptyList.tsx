import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { TextTheme } from '../../theme'
import { testIdWithKey } from '../../utils/testable'

const EmptyList: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Text style={[TextTheme.normal, { textAlign: 'center', marginTop: 100 }]} testID={testIdWithKey('NoneYet')}>
      {t('Global.NoneYet!')}
    </Text>
  )
}

export default EmptyList
