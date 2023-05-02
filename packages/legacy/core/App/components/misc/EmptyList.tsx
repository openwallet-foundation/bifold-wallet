import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

export interface EmptyListProps {
  message?: string
}

const EmptyList: React.FC<EmptyListProps> = ({ message }) => {
  const { t } = useTranslation()
  const { ListItems, Assets, ColorPallet } = useTheme()

  return (
    <View style={{ paddingTop: 100, height: '100%', backgroundColor: ColorPallet.brand.primaryBackground }}>
      <Assets.svg.emptyWallet fill={ListItems.emptyList.color} height={100} />
      <Text style={[ListItems.emptyList, { textAlign: 'center' }]} testID={testIdWithKey('NoneYet')}>
        {message || t('Global.NoneYet!')}
      </Text>
    </View>
  )
}

export default EmptyList
