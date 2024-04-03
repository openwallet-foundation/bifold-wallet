import { ConnectionRecord, ConnectionType, DidExchangeState } from '@aries-framework/core'
import { useConnections } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, Touchable, View } from 'react-native'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import ContactListItem from '../components/listItems/ContactListItem'
import EmptyListContacts from '../components/misc/EmptyListContacts'
import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'
import { theme } from '../theme'
import { TouchableOpacity } from 'react-native'
import { set } from 'mockdate'
import ManageInvitesModal from '../components/modals/ManageInvitesModal'
import SendInviteModal from '../components/modals/SendInviteModal'

interface ListContactsProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const ListContacts: React.FC<ListContactsProps> = ({ navigation }) => {

  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const [showSendInviteModal, setShowSendInviteModal] = React.useState(false)

  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
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
  const { records } = useConnections()
  const [store] = useStore()
  const { contactHideList } = useConfiguration()
  // Filter out mediator agents and hidden contacts when not in dev mode
  let connections: ConnectionRecord[] = records
  if (!store.preferences.developerModeEnabled) {
    connections = records.filter((r) => {
      return (
        !r.connectionTypes.includes(ConnectionType.Mediator) &&
        !contactHideList?.includes((r.theirLabel || r.alias) ?? '') &&
        r.state === DidExchangeState.Completed
      )
    })
  }

  const onPressAddContact = () => {
    navigation.getParent()?.navigate(Stacks.ConnectStack, { screen: Screens.Scan, params: { defaultToConnect: true } })
  }

  const onPressViewInvites = () => {
    setShowInviteModal(true)
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: 'white', padding: 10 }}>
        <TouchableOpacity onPress={() => setShowSendInviteModal(true)}>
          <Text style={{ ...theme.TextTheme.label, color: 'black' }}>Invite +</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowInviteModal(true)}>
          <Text style={{ ...theme.TextTheme.label, color: 'black' }}>My Invites</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={style.list}
        data={connections}
        ItemSeparatorComponent={() => <View style={style.itemSeparator} />}
        keyExtractor={(connection) => connection.id}
        renderItem={({ item: connection }) => <ContactListItem contact={connection} navigation={navigation} />}
        ListEmptyComponent={() => <EmptyListContacts navigation={navigation} />}
      />

      <ManageInvitesModal
        showManageInvitesScreen={showInviteModal}
        setShowManageInvitesScreen={setShowInviteModal}
        navigation={navigation}
      />

      <SendInviteModal
        showSendInviteScreen={showSendInviteModal}
        setShowSendInviteScreen={setShowSendInviteModal}
      />


    </View>
  )
}

export default ListContacts
