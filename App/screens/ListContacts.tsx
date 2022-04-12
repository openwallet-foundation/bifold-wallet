import type { ConnectionRecord } from '@aries-framework/core'

import { useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'

import { ContactListItem } from '../components'
import { useThemeContext } from '../utils/themeContext'

import EmptyList from 'App/components/misc/EmptyList'

const ListContacts: React.FC = () => {
  const { connections } = useConnections()
  const { t } = useTranslation()
  const { ColorPallet } = useThemeContext()
  return (
    <FlatList
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      data={connections}
      keyExtractor={(item: ConnectionRecord) => item.did}
      ListEmptyComponent={() => <EmptyList />}
      renderItem={({ item }) => <ContactListItem contact={item} />}
    />
  )
}

export default ListContacts
