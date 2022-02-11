import { CredentialState, ProofState } from '@aries-framework/core'
import { useCredentialByState, useProofByState } from '@aries-framework/react-hooks'
import React from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import NotificationListItem, { NotificationType } from 'components/listItems/NotificationListItem'

const ListNotifications: React.FC = () => {
  const offers = useCredentialByState(CredentialState.OfferReceived)
  const proofs = useProofByState(ProofState.RequestReceived)
  const notifications = [...offers, ...proofs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
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
