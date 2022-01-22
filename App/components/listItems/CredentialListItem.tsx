import type { CredentialRecord } from '@aries-framework/core'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { CredentialStackParams } from 'navigators/CredentialStack'

import { useNavigation } from '@react-navigation/core'
import { DateTime } from 'luxon'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors } from '../../theme'
import { parseSchema } from '../../utils/helpers'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: Colors.shadow,
    borderRadius: 15,
    justifyContent: 'space-between',
  },
})

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Credential Details', { credentialId: credential.id })}
    >
      <View>
        <Title style={{ color: Colors.text }}>{parseSchema(credential.metadata.schemaId)}</Title>
        <Text style={{ color: Colors.text }}>
          Issued on {DateTime.fromJSDate(credential.createdAt).toFormat('LLL d, yyyy')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: Colors.text }}>
          {credential?.credentialAttributes?.find((n) => n.name === 'given_name')?.value}{' '}
          {credential?.credentialAttributes?.find((n) => n.name === 'surname')?.value}
        </Text>

        <Icon name="chevron-right" color={Colors.text} size={30} />
      </View>
    </TouchableOpacity>
  )
}

export default CredentialListItem
