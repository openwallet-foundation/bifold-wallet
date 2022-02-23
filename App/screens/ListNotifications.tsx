import React from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { useNotifications } from '../hooks/notifcations'

import NotificationListItem, { NotificationType } from 'components/listItems/NotificationListItem'

const ListNotifications: React.FC = () => {
  const { notifications } = useNotifications()

  return (
    <FlatList
      data={notifications}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: index === notifications.length - 1 ? 15 : 0,
          }}
        >
          {item.type === 'CredentialRecord' ? (
            <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
          ) : (
            <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
          )}
        </View>
      )}
    />
  )
}

export default ListNotifications
