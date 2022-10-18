import { ConnectionRecord, ConnectionType, DidExchangeState } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { t } from 'i18next'
import React from 'react'
import { FlatList, View } from 'react-native'

import ContactListItem from '../components/listItems/ContactListItem'
import EmptyList from '../components/misc/EmptyList'
import { useTheme } from '../contexts/theme'

interface ListContactsProps {
  navigation: any
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { records } = useConnections({
    excludedTypes: [ConnectionType.Mediator],
    connectionState: DidExchangeState.Completed,
  })
  const { ColorPallet } = useTheme()
  return (
    <>
      {records.length > 0 ? (
        <FlatList
          style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
          data={records}
          renderItem={({ item }) => <ContactListItem contact={item} navigation={navigation} />}
          keyExtractor={(item: ConnectionRecord) => item?.did || item.id}
        />
      ) : (
        <View style={{ height: '100%', justifyContent: 'center' }}>
          <EmptyList message={t('Contacts.EmptyList')} />
        </View>
      )}
    </>
  )
}

export default ListContacts
