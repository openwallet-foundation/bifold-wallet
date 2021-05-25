import React, { useContext } from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

import { useHistory, useLocation } from 'react-router-native'

import AppHeaderLarge from '../../components/AppHeaderLarge/index'
import BackButton from '../../components/BackButton/index'

import PAButton from '../../components/PAButton'

import { ErrorsContext } from '../../contexts/Errors/index'
import { NotificationsContext } from '../../contexts/Notifications/index'

import AppStyles from '../../../assets/styles'

function Home() {
  // const history = useHistory()
  // const location = useLocation()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <View style={{ flex: 1 }}>
      <BackButton backExit={true} />
      <View style={AppStyles.viewFull}>
        <View style={[AppStyles.tab, { top: 80 }]}>
          <AppHeaderLarge />
          <PAButton title="Scanner" onPress={() => {}} />
          <PAButton title="Show QR Code" onPress={() => {}} />
        </View>
      </View>
    </View>
  )
}

export default Home
