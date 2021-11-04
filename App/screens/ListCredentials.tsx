import type { CredentialRecord } from '@aries-framework/core'

import { useCredentials } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList } from 'react-native'

import { backgroundColor } from '../globalStyles'

import { CredentialListItem, Text } from 'components'

const ListCredentials: React.FC = () => {
  const { credentials } = useCredentials()

  return (
    <FlatList
      data={credentials}
      renderItem={({ item }) => <CredentialListItem credential={item} />}
      style={{ backgroundColor }}
      keyExtractor={(item: CredentialRecord) => String(item.credentialId)}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>None yet!</Text>}
    />
  )
}

export default ListCredentials
