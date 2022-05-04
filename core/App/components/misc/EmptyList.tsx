import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const EmptyList: React.FC = () => {
  const { ListItems } = useTheme()
  const { t } = useTranslation()

  return (
    <Text style={[ListItems.emptyList, { textAlign: 'center', marginTop: 100 }]} testID={testIdWithKey('NoneYet')}>
      {t('Global.NoneYet!')}
    </Text>
  )
}

export default EmptyList
