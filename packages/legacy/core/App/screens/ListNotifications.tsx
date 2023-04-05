import React from 'react'
import { FlatList, View } from 'react-native'

import { isPresentationReceived } from '../../verifier'
import NotificationListItem, { NotificationType } from '../components/listItems/NotificationListItem'
import NoNewUpdates from '../components/misc/NoNewUpdates'
import { useConfiguration } from '../contexts/configuration'

const ListNotifications: React.FC = () => {
  const { useCustomNotifications } = useConfiguration()
  const { notifications } = useCustomNotifications()

  const getNotificationType = (notification: any): NotificationType => {
    let retType = NotificationType.ProofRequest
    if (notification.type === 'CredentialRecord') {
      retType = NotificationType.CredentialOffer
    } else if (notification.type === 'ProofRecord') {
      if (isPresentationReceived(notification)) {
        retType = NotificationType.Proof
      } else {
        retType = NotificationType.ProofRequest
      }
    } else if (notification.type === 'CustomNotification') {
      retType = NotificationType.Custom
    }
    return retType
  }

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
          <NotificationListItem notificationType={getNotificationType(notification)} notification={notification} />
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
