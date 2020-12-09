import React, {useState, useEffect, useContext} from 'react'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory, useLocation} from 'react-router-native'

import AppHeaderLarge from '../AppHeaderLarge/index.js'
import BackButton from '../BackButton/index.js'
import LoadingOverlay from '../LoadingOverlay/index.js'

import {ErrorsContext} from '../Errors/index.js'
import {NotificationsContext} from '../Notifications/index.js'

import AppStyles from '../../assets/styles'

function Home() {
  let history = useHistory()
  let location = useLocation()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <>
    <BackButton backExit={true} />
    <View style={AppStyles.viewFull}>
      <AppHeaderLarge />
      <View style={AppStyles.tab}>
        <Text style={[AppStyles.h2, AppStyles.textBlueDark]}>Home</Text>
        <TouchableOpacity
          style={[AppStyles.button, AppStyles.buttonGreen, {marginTop: 80}]}
          onPress={() => {
            /*errors.setVisible(true)
            errors.setText("Workflows not\nyet created")
            errors.setPath("/home")*/
            history.push('/workflow/connect')
          }}>
          <Text style={[AppStyles.h2, AppStyles.textWhite]}>Begin</Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
  )
}

export default Home
