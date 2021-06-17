import React, { useState, useContext } from 'react'

import { View, Dimensions, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import { RNCamera } from 'react-native-camera'

import { AppHeader, BackButton, LoadingOverlay } from 'components'

import { decodeInvitationFromUrl } from 'aries-framework'
import AgentContext from '../contexts/AgentProvider'

import AppStyles from '../../assets/styles'

let CameraWidth = 0.82 * Dimensions.get('window').width

//  TODO - Add props interface
function QRCodeScanner(props) {
  const history = useHistory()

  //Reference to the agent context
  const agentContext = useContext(AgentContext)

  props.setWorkflowInProgress(false)

  //State to determine if we should show the camera any longer
  const [cameraActive, setCameraActive] = useState(true)

  const _handleBarCodeRead = async (event) => {
    setCameraActive(false)

    console.log('Scanned QR Code')
    console.log('BARCODE: ', event)

    const decodedInvitation = await decodeInvitationFromUrl(event.data)

    console.log('New Invitation:', decodedInvitation)

    const connectionRecord = await agentContext.agent.connections.receiveInvitation(decodedInvitation, {
      autoAcceptConnection: true,
    })

    console.log('New Connection Record', connectionRecord)

    props.setWorkflow('connecting')
  }

  if (cameraActive) {
    return (
      <View>
        <BackButton backPath={'/home'} />
        <View style={AppStyles.viewFull}>
          {/* <View style={AppStyles.header}>
            <AppHeader headerText={'SCAN CODE'} />
          </View> */}
          <View style={AppStyles.tab}>
            <RNCamera
              style={{ height: '100%', width: '100%' }}
              type={RNCamera.Constants.Type.back}
              captureAudio={false}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
              barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
              onBarCodeRead={_handleBarCodeRead}
            ></RNCamera>
          </View>
        </View>
      </View>
    )
  } else {
    return <LoadingOverlay />
  }
}

export default QRCodeScanner

const styles = StyleSheet.create({
  header: {
    height: '28%',
    justifyContent: 'center',
  },
  camera: {
    width: CameraWidth,
    height: CameraWidth,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: '#0A1C40',
    borderRadius: 3,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
  },
})
