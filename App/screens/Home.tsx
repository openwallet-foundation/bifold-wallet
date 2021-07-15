import React from 'react'

import { FlatList } from 'react-native'

import { Button, SafeAreaScrollView, AppHeaderLarge, ModularView, NotificationListItem } from 'components'

interface Props {
  navigation: any
}

const notifications = [
  { title: 'Happy Traveler', subtitle: 'Credential Offer' },
  { title: 'Indicio.tech', subtitle: 'Credential Offer' },
  { title: 'DMV', subtitle: 'Credential Offer' },
]

const Home: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <Button title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
      <ModularView
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
