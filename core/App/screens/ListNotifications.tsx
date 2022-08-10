import React from 'react'
import { FlatList, View } from 'react-native'

import NotificationListItem, { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import { useNotifications } from '../hooks/notifications'

const ListNotifications: React.FC = () => {
  const { notifications } = useNotifications()

  return (
    <FlatList
      data={notifications}
      keyExtractor={(notification) => notification.id}
      renderItem={({ item: notification, index }) => (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: index === notifications.length - 1 ? 45 : 0,
          }}
        >
          {notification.type === 'CredentialRecord' ? (
            <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={notification} />
          ) : (
            <NotificationListItem notificationType={NotificationType.ProofRequest} notification={notification} />
          )}
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={{ margin: 15 }}>
          <NoNewUpdates />
        </View>
      )}
    />
  )
}

export default ListNotifications
