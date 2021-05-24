import React, { useContext } from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

import { useHistory, useLocation } from 'react-router-native'

import AppHeaderLarge from '../../components/AppHeaderLarge/index'
import BackButton from '../../components/BackButton/index'

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
          <TouchableOpacity
            style={[AppStyles.button, AppStyles.backgroundPrimary, { marginTop: 10 }]}
            onPress={() => {
              /*errors.setVisible(true)
            errors.setText("Workflows not\nyet created")
            errors.setPath("/home")*/
              // history.push('/workflow/connect')
            }}
          >
            <Text style={[AppStyles.h2, AppStyles.textWhite]}>Begin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Home
