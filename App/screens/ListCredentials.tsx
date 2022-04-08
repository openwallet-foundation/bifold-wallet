import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import { CredentialListItem, Text } from '../components'
import { useThemeContext } from '../utils/themeContext'

const ListCredentials: React.FC = () => {
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const { t } = useTranslation()
  const { ColorPallet } = useThemeContext()
  const emptyListComponent = () => <Text style={{ textAlign: 'center', marginTop: 100 }}>{t('Global.NoneYet!')}</Text>

  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
      keyExtractor={(item: CredentialRecord) => item.credentialId || item.id}
      ListEmptyComponent={emptyListComponent}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: index === credentials.length - 1 ? 45 : 0,
          }}
        >
          <CredentialListItem credential={item} />
        </View>
      )}
    />
  )
}

export default ListCredentials
