/* eslint-disable no-console */
import { ConnectionRecord, ConnectionRecordProps, DidDoc } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { ContactListItem, Text } from 'components'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ScrollViewBase } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { backgroundColor } from '../globalStyles'

const ListContacts: React.FC = () => {
  const { connections } = useConnections()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const date = new Date('04 Dec 1995 00:12:00 GMT')

  const mockContacts = [
    {
      id: '1',
      alias: 'Burger King',
      // address: 'Seoul',
      // phone: '02-1234-1234',
      invitation: {
        label: 'BurgerKing',
      },
      did: '46pMrwbj34Wz376SEdlg2',
      createdAt: date,
    },
    {
      id: '2',
      alias: 'Lotteria',
      // address: 'Seoul',
      // phone: '02-4321-4321',
      invitation: {
        label: 'Lotteria',
      },
      did: 'Q2MlrW2AQjDTCrcGFqruQ9',
      createdAt: date,
    },
    {
      id: '3',
      alias: 'McDonalds',
      // address: 'Seoul',
      // phone: '02-1212-3434',
      invitation: {
        label: 'McDonalds',
      },
      did: 'W9Sp29feDeHwM1X0XX9dl3',
      createdAt: date,
    },
  ]

  const [mockData, setMockData] = useState<any[]>(mockContacts)

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

  return (
    <SafeAreaView>
      <TextInput
        placeholder={'Search for stores and restaurants nearby'}
        value={searchQuery}
        onChangeText={(e) => {
          setSearchQuery(e)
        }}
        style={{
          backgroundColor: 'white',
          margin: 10,
          borderRadius: 20,
          paddingLeft: 20,
        }}
      />
      <FlatList
        data={searchQuery === '' ? mockData : mockData.filter((it) => it.invitation.label.includes(searchQuery))}
        renderItem={({ item }) => <ContactListItem contact={item} />}
        keyExtractor={(item: ConnectionRecord) => item.did}
        style={{ backgroundColor }}
        ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>{t('Global.NoneYet!')}</Text>}
      />
    </SafeAreaView>
  )
}

export default ListContacts
