import React, { useContext } from 'react'
import { useNavigation } from '@react-navigation/native'

import { PAButton, SafeAreaScrollView, AppHeaderLarge } from 'components'

import { ErrorsContext } from '../contexts/Errors'
import { NotificationsContext } from '../contexts/Notifications'

function Home() {
  const navigation = useNavigation<any>()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <PAButton title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
      <PAButton title="Show QR Code" onPress={() => {}} />
    </SafeAreaScrollView>
  )
}

export default Home
