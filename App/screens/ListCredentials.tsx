import React from 'react'
import { FlatList } from 'react-native'
import { useCredentials } from '@aries-framework/react-hooks'
import type { CredentialRecord } from '@aries-framework/core'

import { CredentialListItem, Text } from 'components'

import { backgroundColor } from '../globalStyles'

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
