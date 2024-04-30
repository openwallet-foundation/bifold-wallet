import { ConnectionRecord, ConnectionType, DidExchangeState } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, StyleSheet, View } from 'react-native'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import ContactListItem from '../components/listItems/ContactListItem'
import EmptyListContacts from '../components/misc/EmptyListContacts'
import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'
import { BifoldAgent } from '../utils/agent'
import { fetchContactsByLatestMessage } from '../utils/contacts'
import { testIdWithKey } from '../utils/testable'

interface ListContactsProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const [connections, setConnections] = useState<ConnectionRecord[]>([])
  const [store] = useStore()
  const { contactHideList } = useConfiguration()
  const style = StyleSheet.create({
    list: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    itemSeparator: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      height: 1,
      marginHorizontal: 16,
    },
  })

  useEffect(() => {
    const fetchAndSetConnections = async () => {
      if (!agent) return
      let orderedContacts = await fetchContactsByLatestMessage(agent as BifoldAgent)

      // if developer mode is disabled, filter out mediator connections and connections in the hide list
      if (!store.preferences.developerModeEnabled) {
        orderedContacts = orderedContacts.filter((r) => {
          return (
            !r.connectionTypes.includes(ConnectionType.Mediator) &&
            !contactHideList?.includes((r.theirLabel || r.alias) ?? '') &&
            r.state === DidExchangeState.Completed
          )
        })
      }

      setConnections(orderedContacts)
    }

    fetchAndSetConnections().catch((err) => {
      agent?.config.logger.error('Error fetching contacts:', err)
      const error = new BifoldError(t('Error.Title1046'), t('Error.Message1046'), (err as Error)?.message ?? err, 1046)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    })
  }, [agent])

  const onPressAddContact = () => {
    navigation.getParent()?.navigate(Stacks.ConnectStack, { screen: Screens.Scan, params: { defaultToConnect: true } })
  }

  useEffect(() => {
    if (store.preferences.useConnectionInviterCapability) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton
            buttonLocation={ButtonLocation.Right}
            accessibilityLabel={t('Contacts.AddContact')}
            testID={testIdWithKey('AddContact')}
            onPress={onPressAddContact}
            icon="plus-circle-outline"
          />
        ),
      })
    } else {
      navigation.setOptions({
        headerRight: () => false,
      })
    }
  }, [store.preferences.useConnectionInviterCapability])

  return (
    <View>
      <FlatList
        style={style.list}
        data={connections}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => <ContactListItem contact={connection} navigation={navigation} />}
        ListEmptyComponent={() => <EmptyListContacts navigation={navigation} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

export default ListContacts
