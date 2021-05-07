import React, { useState, useContext } from 'react'

import { View } from 'react-native'

import { useHistory } from 'react-router-native'

import { RNCamera } from 'react-native-camera'

import AppHeader from '../../AppHeader/index'
import BackButton from '../../BackButton/index'
import LoadingOverlay from '../../LoadingOverlay/index'

import { decodeInvitationFromUrl } from 'aries-framework'
import AgentContext from '../../AgentProvider/'

import Styles from './styles'
import AppStyles from '../../../assets/styles'

//  TODO - Add props interface
function QRCodeScanner(props) {
  const history = useHistory()

  //Reference to the agent context
  const agentContext = useContext(AgentContext)

  props.setWorkflowInProgress(false)

  //State to determine if we should show the camera any longer
  const [cameraActive, setCameraActive] = useState(true)

  const barcodeRecognized = ({ barcodes }) => {
    barcodes.forEach(async (barcode) => {
      console.log(`Scanned QR Code`)
      console.log('BARCODE: ', barcode)

      //Turn off camera so that we don't scan again
      setCameraActive(false)

      const decodedInvitation = await decodeInvitationFromUrl(barcode.data)

      console.log('New Invitation:', decodedInvitation)

      const connectionRecord = await agentContext.agent.connections.receiveInvitation(decodedInvitation, {
        autoAcceptConnection: true,
      })

      console.log('New Connection Record', connectionRecord)

      props.setWorkflow('connecting')
    })
  }

  if (cameraActive) {
    return (
      <>
        <BackButton backPath={'/home'} />
        <View style={AppStyles.viewFull}>
          <View style={AppStyles.header}>
            <AppHeader headerText={'SCAN CODE'} />
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
              }}
              googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}
              onGoogleVisionBarcodesDetected={({ barcodes }) => {
                barcodeRecognized({ barcodes })
              }}
            ></RNCamera>
          </View>
        </View>
      </>
    )
  } else {
    return <LoadingOverlay />
  }
}

export default QRCodeScanner
