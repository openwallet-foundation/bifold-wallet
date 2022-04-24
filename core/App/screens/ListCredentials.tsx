import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import React from 'react'
import { FlatList, View } from 'react-native'

import { CredentialListItem } from '../components'
import EmptyList from '../components/misc/EmptyList'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'

const ListCredentials: React.FC = () => {
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const [state] = useStore()
  const { revoked } = state.credential
  const { ColorPallet } = useTheme()

  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
      keyExtractor={(item: CredentialRecord) => item.credentialId || item.id}
      ListEmptyComponent={() => <EmptyList />}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: index === credentials.length - 1 ? 45 : 0,
          }}
        >
          <CredentialListItem credential={item} revoked={revoked.has(item.id) || revoked.has(item.credentialId)} />
        </View>
      )}
    />
  )
}

export default ListCredentials
