import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import EmptyWallet from '../../assets/img/empty-wallet.svg'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface EmptyListProps {
  message?: string
}

const EmptyList: React.FC<EmptyListProps> = ({ message }) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()

  return (
    <View style={{ marginTop: 100, height: '100%' }}>
      <EmptyWallet fill={ListItems.emptyList.color} height={100} />
      <Text style={[ListItems.emptyList, { textAlign: 'center' }]} testID={testIdWithKey('NoneYet')}>
        {message || t('Global.NoneYet!')}
      </Text>
    </View>
  )
}

export default EmptyList
