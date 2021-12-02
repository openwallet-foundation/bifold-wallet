/* eslint-disable no-console */
import { ConnectionRecord, ConnectionRecordProps, DidDoc } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { ContactListItem, Text } from 'components'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'

import { backgroundColor } from '../globalStyles'

const ListContacts: React.FC = () => {
  const { connections } = useConnections()
  const { t } = useTranslation()

  const mockContacts = [
    {
      id: '1',
      alias: 'Burger King',
      // address: 'Seoul',
      // phone: '02-1234-1234',
      invitation: {
        label: 'BurgerKing',
      },
      did: '1',
    },
    {
      id: '2',
      alias: 'Lotteria',
      // address: 'Seoul',
      // phone: '02-4321-4321',
      invitation: {
        label: 'BurgerKing',
      },
      did: '2',
    },
    {
      id: '3',
      alias: 'McDonalds',
      // address: 'Seoul',
      // phone: '02-1212-3434',
      invitation: {
        label: 'BurgerKing',
      },
      did: '3',
    },
  ]

  const [mockData, setMockData] = useState<any[]>(mockContacts)
  console.log(mockData)

  useEffect(() => {
    connections.map((it) => {
      setMockData([
        ...mockData,
        {
          id: it.id,
          alias: it.alias,
          did: it.did,
          invitation: {
            label: it.invitation?.label,
          },
        },
      ])
    })
  }, [])

  console.log(mockData)

  return (
    <FlatList
      data={mockData}
      renderItem={({ item }) => <ContactListItem contact={item} />}
      keyExtractor={(item: ConnectionRecord) => item.did}
      style={{ backgroundColor }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>{t('Global.NoneYet!')}</Text>}
    />
  )
}

export default ListContacts
