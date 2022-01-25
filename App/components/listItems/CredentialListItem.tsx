import type { CredentialRecord } from '@aries-framework/core'
import type { StackNavigationProp } from '@react-navigation/stack'

import { useNavigation } from '@react-navigation/core'
import { DateTime } from 'luxon'
import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { credentialDateTimeFormatString, IndexedIndyCredentialMetadata, indyCredentialKey } from '../../constants'
import { Colors, CredentialTheme } from '../../theme'
import { parseSchema } from '../../utils/helpers'
import Text from '../texts/Text'
import Title from '../texts/Title'

import { CredentialStackParams } from 'types/navigators'

interface CredentialListItemProps {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    minHeight: 125,
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: CredentialTheme.background,
    borderRadius: 15,
    justifyContent: 'space-between',
  },
})

const CredentialListItem: React.FC<CredentialListItemProps> = ({ credential }) => {
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Credential Details', { credentialId: credential.id })}
    >
      <View>
        <Title style={{ color: Colors.text }}>
          {parseSchema(credential.metadata.get<IndexedIndyCredentialMetadata>(indyCredentialKey)?.schemaId)}
        </Title>
        <Text style={{ color: Colors.text }}>
          Issued on {DateTime.fromJSDate(credential.createdAt).toFormat(credentialDateTimeFormatString)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Icon name="chevron-right" color={Colors.text} size={30} />
      </View>
    </TouchableOpacity>
  )
}

export default CredentialListItem
