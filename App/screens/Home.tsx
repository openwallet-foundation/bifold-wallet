import React, { useContext } from 'react'

import { FlatList } from 'react-native'

import { PAButton, SafeAreaScrollView, AppHeaderLarge, ModularScrollView, NotificationListItem } from 'components'

import { ErrorsContext } from '../contexts/Errors'
import { NotificationsContext } from '../contexts/Notifications'

interface Props {
  navigation: any
}

const Home: React.FC<Props> = ({ navigation }) => {
  const errors = useContext(ErrorsContext)
  const notifications = useContext<any>(NotificationsContext)

  console.log('NOTIFICATIONS', notifications)

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <PAButton title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
      <ModularScrollView
        title="Notifications"
        content={
          notifications.length ? (
            <FlatList data={notifications} renderItem={({ item }) => <NotificationListItem notification={item} />} />
          ) : (
            "Here you'll get notified about stuff"
          )
        }
      />
    </SafeAreaScrollView>
  )
}

export default Home
