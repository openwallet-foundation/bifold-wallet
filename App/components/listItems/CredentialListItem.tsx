import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { DateTime } from 'luxon'
import { useNavigation } from '@react-navigation/core'
import type { CredentialRecord } from '@aries-framework/core'
import Icon from 'react-native-vector-icons/MaterialIcons'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { CredentialStackParams } from 'navigators/CredentialStack'

import Title from '../texts/Title'
import Text from '../texts/Text'

import { shadow, textColor } from '../../globalStyles'
import { parseSchema } from '../../helpers'

interface Props {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: shadow,
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
        <Title style={{ color: textColor }}>{parseSchema(credential.metadata.schemaId)}</Title>
        <Text style={{ color: textColor }}>
          Issued on {DateTime.fromJSDate(credential.createdAt).toFormat('LLL d, yyyy')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: textColor }}>
          {credential?.credentialAttributes?.find((n) => n.name === 'given_name')?.value}{' '}
          {credential?.credentialAttributes?.find((n) => n.name === 'surname')?.value}
        </Text>

        <Icon name="chevron-right" color={textColor} size={30} />
      </View>
    </TouchableOpacity>
  )
}

export default CredentialListItem
