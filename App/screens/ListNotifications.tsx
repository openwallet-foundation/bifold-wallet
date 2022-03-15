import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Text, View } from 'react-native'

import { useNotifications } from '../hooks/notifcations'
import { TextTheme } from '../theme'

import NotificationListItem, { NotificationType } from 'components/listItems/NotificationListItem'
import InfoTextBox from 'components/texts/InfoTextBox'

const ListNotifications: React.FC = () => {
  const { notifications } = useNotifications()
  const { t } = useTranslation()

  const emptyListComponent = () => (
    <View style={{ margin: 15 }}>
      <InfoTextBox>
        <Text style={TextTheme.normal}>{t('Home.NoNewUpdates')}</Text>
      </InfoTextBox>
    </View>
  )

  return (
    <FlatList
      data={notifications}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginHorizontal: 15,
            marginTop: 15,
            marginBottom: index === notifications.length - 1 ? 45 : 0,
          }}
        >
          {item.type === 'CredentialRecord' ? (
            <NotificationListItem notificationType={NotificationType.CredentialOffer} notification={item} />
          ) : (
            <NotificationListItem notificationType={NotificationType.ProofRequest} notification={item} />
          )}
        </View>
      )}
      ListEmptyComponent={emptyListComponent()}
    />
  )
}

export default ListNotifications
