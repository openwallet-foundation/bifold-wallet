import type { CredentialRecord } from '@aries-framework/core'

import { DateTime } from 'luxon'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { shadow, textColor } from '../../globalStyles'
import { parseSchema } from '../../helpers'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  credential: CredentialRecord
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: shadow,
    borderRadius: 15,
    justifyContent: 'space-between',
  },
})

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  return (
    <View style={styles.container}>
      <View>
        <Title style={{ color: textColor }}>{parseSchema(credential.metadata.schemaId)}</Title>
        <Text style={{ color: textColor }}>
          {'Coupons issued: '}
          {credential?.credentialAttributes?.find((n: { name: string }) => n.name === 'stampcount')?.value}
        </Text>
        <Text style={{ color: textColor }}>
          {'Issued on: '}
          {credential?.credentialAttributes?.find((n: { name: string }) => n.name === 'date')?.value}
        </Text>
      </View>
    </View>
  )
}

export default CredentialListItem
