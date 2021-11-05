import type { CredentialRecord } from '@aries-framework/core'

import React from 'react'
import { View, StyleSheet } from 'react-native'

import { shadow, borderRadius } from '../../globalStyles'
import { parseSchema } from '../../helpers'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    borderRadius,
    backgroundColor: shadow,
  },
})

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  return (
    <View style={styles.container}>
      <Title>{parseSchema(credential.metadata.schemaId)}</Title>
      <Text>{credential.credentialId}</Text>
    </View>
  )
}

export default CredentialListItem
