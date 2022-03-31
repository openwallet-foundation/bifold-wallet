import type { ConnectionRecord } from '@aries-framework/core'

import { useConnections } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'

import { ContactListItem, Text } from '../components'
import { useThemeContext } from '../utils/themeContext'

const ListContacts: React.FC = () => {
  const { connections } = useConnections()
  const { t } = useTranslation()
  const { ColorPallet } = useThemeContext()
  return (
    <FlatList
      data={connections}
      renderItem={({ item }) => <ContactListItem contact={item} />}
      keyExtractor={(item: ConnectionRecord) => item.did}
      style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>{t('Global.NoneYet!')}</Text>}
    />
  )
}

export default ListContacts
