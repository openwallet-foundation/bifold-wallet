import React, {useState, useEffect, useContext} from 'react'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import {RNCamera} from 'react-native-camera'

import AppHeader from '../AppHeader/index.js'
import BackButton from '../BackButton/index.js'
import LoadingOverlay from '../LoadingOverlay/index.js'

import {ErrorsContext} from '../Errors/index.js'
import {NotificationsContext} from '../Notifications/index.js'

import Styles from './styles'
import AppStyles from '../../assets/styles'

function QRCodeScanner(props) {
  let history = useHistory()

  props.setWorkflowInProgress(false)

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <>
    <BackButton backPath={'/home'} />
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'SCAN QR CODE'} />
      </View>
      <View style={AppStyles.tab}>
        <RNCamera
          style={Styles.camera}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}>
          <TouchableOpacity
            style={{width: '100%', height: '100%'}}
            onPress={() => {
              props.setWorkflow('connecting')
            }}
          />
        </RNCamera>
      </View>
    </View>
    </>
  )
}

export default QRCodeScanner
