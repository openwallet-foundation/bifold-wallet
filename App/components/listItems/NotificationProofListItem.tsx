import type { StackNavigationProp } from '@react-navigation/stack'

import { ProofRecord } from '@aries-framework/core'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, borderRadius, TextTheme, ColorPallet } from '../../theme'
import Text from '../texts/Text'
import Title from '../texts/Title'

import { HomeStackParams } from 'types/navigators'
interface Props {
  notification: ProofRecord
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    borderRadius,
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
})

const NotificationProofListItem: React.FC<Props> = ({ notification }) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const { t } = useTranslation()

  // TODO: Reincorporate according to UI wireframes
  // const connection = connectionRecordFromId(notification.connectionId)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Proof Request', { proofId: notification.id })}
    >
      <View>
        <Title>{t('ProofRequest.ProofRequest')}</Title>
        <Text style={TextTheme.normal}>{notification.requestMessage?.indyProofRequest?.name}</Text>
        {/* {!!connection && <Text style={TextTheme.normal}>{connection?.alias || connection?.invitation?.label}</Text>} */}
      </View>
      <Icon name="chevron-right" color={Colors.text} size={30} />
    </TouchableOpacity>
  )
}

export default NotificationProofListItem
