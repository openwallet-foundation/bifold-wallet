import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { ProofRecord } from '@aries-framework/core'
import { useConnectionById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, borderRadius } from '../../Theme'
import Text from '../texts/Text'

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
    backgroundColor: Colors.backgroundColor,
  },
  title: {
    fontWeight: 'bold',
  },
})

const NotificationProofListItem: React.FC<Props> = ({ notification }) => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()

  const { connectionId, requestMessage, id } = notification

  const connection = useConnectionById(connectionId)

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Proof Request', { proofId: id })}>
      <View>
        <Text style={styles.title}>{requestMessage?.indyProofRequest?.name}</Text>
        <Text>{connection?.alias || connection?.invitation?.label}</Text>
      </View>
      <Icon name="chevron-right" color={Colors.textColor} size={30} />
    </TouchableOpacity>
  )
}

export default NotificationProofListItem
