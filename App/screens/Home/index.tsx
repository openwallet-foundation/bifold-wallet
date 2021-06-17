import React, { useContext } from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

import { useNavigation } from '@react-navigation/native'

import { useHistory, useLocation } from 'react-router-native'

import AppHeaderLarge from '../../components/AppHeaderLarge'
import BackButton from '../../components/BackButton'

import { PAButton } from 'components'

import { ErrorsContext } from '../../contexts/Errors/index'
import { NotificationsContext } from '../../contexts/Notifications/index'

import AppStyles from '../../../assets/styles'

function Home() {
  // const history = useHistory()
  // const location = useLocation()
  const navigation = useNavigation<any>()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <View style={{ flex: 1 }}>
      <BackButton backExit={true} />
      <View style={AppStyles.viewFull}>
        <View style={[AppStyles.tab, { top: 80 }]}>
          <AppHeaderLarge />
          <PAButton title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
          <PAButton title="Show QR Code" onPress={() => {}} />
        </View>
      </View>
    </View>
  )
}

export default Home
