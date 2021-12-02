import type { CredentialRecord } from '@aries-framework/core'

import { useCredentials } from '@aries-framework/react-hooks'
import { CredentialListItem, Text } from 'components'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'

import { backgroundColor } from '../globalStyles'

const ListCredentials: React.FC = () => {
  const { credentials } = useCredentials()
  const { t } = useTranslation()

  const emptyListComponent = () => <Text style={{ textAlign: 'center', marginTop: 100 }}>{t('Global.NoneYet!')}</Text>

  const keyForItem = (item: CredentialRecord) => String(item.credentialId)

  const mockCredentials = [
    {
      id: 'id1234',
      metadata: {
        schemaId: 'Americano',
      },
      createdAt: Date.now(),
      credentialAttributes: [
        {
          name: 'given_name',
          value: 'John',
        },
        {
          name: 'surname',
          value: 'Doe',
        },
      ],
    },
  ]

  const [mockData, setMockData] = useState<any[]>(mockCredentials)

  useEffect(() => {
    credentials.map((it) => {
      setMockData([
        ...mockCredentials,
        {
          id: it.id,
          metadata: it.metadata,
          createdAt: it.createdAt,
          credentialAttributes: it.credentialAttributes,
        },
      ])
    })
  }, [])

  return (
    <FlatList
      data={mockData}
      style={{ backgroundColor }}
      keyExtractor={keyForItem}
      ListEmptyComponent={emptyListComponent}
      renderItem={({ item }) => <CredentialListItem credential={item} />}
    />
  )
}

export default ListCredentials
