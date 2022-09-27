import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, StyleSheet, ViewStyle } from 'react-native'

import EmptyWallet from '../../assets/img/empty-wallet.svg'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface EmptyListProps {
  message?: string
  styles?: ViewStyle
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  messageContainer: {
    width: '95%',
  },
})

const EmptyList: React.FC<EmptyListProps> = ({ message }) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <EmptyWallet fill={ListItems.emptyList.color} height={100} />
        <Text style={[ListItems.emptyList, { textAlign: 'center' }]} testID={testIdWithKey('NoneYet')}>
          {message || t('Global.NoneYet!')}
        </Text>
      </View>
    </View>
  )
}

export default EmptyList
