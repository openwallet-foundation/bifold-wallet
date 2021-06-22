import React, { useContext } from 'react'

import { PAButton, SafeAreaScrollView, AppHeaderLarge, ModularScrollView } from 'components'

import { ErrorsContext } from '../contexts/Errors'
import { NotificationsContext } from '../contexts/Notifications'

interface Props {
  navigation: any
}

const Home: React.FC<Props> = ({ navigation }) => {
  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <PAButton title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
      <ModularScrollView title="Notifications" content="Here you'll get updates on whatever" />
    </SafeAreaScrollView>
  )
}

export default Home
