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

import AppHeaderLarge from '../AppHeaderLarge/index'
import BackButton from '../BackButton/index'
import LoadingOverlay from '../LoadingOverlay/index'

import {ErrorsContext} from '../Errors/index'
import {NotificationsContext} from '../Notifications/index'

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
        <View style={[AppStyles.tab, {top: 80}]}>
          <AppHeaderLarge />
          <TouchableOpacity
            style={[
              AppStyles.button,
              AppStyles.backgroundPrimary,
              {marginTop: 10},
            ]}
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
