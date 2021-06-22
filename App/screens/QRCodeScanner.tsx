import React, { useState, useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { RNCamera } from 'react-native-camera'

import { LoadingOverlay } from 'components'

import { decodeInvitationFromUrl } from 'aries-framework'
import AgentContext from '../contexts/AgentProvider'

interface Props {}

const QRCodeScanner: React.FC<Props> = () => {
  const agentContext = useContext<any>(AgentContext)

  //State to determine if we should show the camera any longer
  const [cameraActive, setCameraActive] = useState(true)

  const _handleBarCodeRead = async (event: any) => {
    setCameraActive(false)

    console.log('Scanned QR Code')
    console.log('BARCODE: ', event)

    const decodedInvitation = await decodeInvitationFromUrl(event.data)

    console.log('New Invitation:', decodedInvitation)
    console.log('AGENT_CONTEXT', agentContext)

    const connectionRecord = await agentContext.agent.connections.receiveInvitation(decodedInvitation, {
      autoAcceptConnection: true,
    })

    console.log('New Connection Record', connectionRecord)
  }

  if (cameraActive) {
    return (
      <View>
        <RNCamera
          style={styles.camera}
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
        />
        <View style={styles.viewFinder} />
      </View>
    )
  } else {
    return <LoadingOverlay visible={true} />
  }
}

export default QRCodeScanner

const styles = StyleSheet.create({
  camera: {
    height: '100%',
    width: '100%',
  },
  viewFinder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -125,
    marginTop: -125,
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#35823f',
    borderStyle: 'dashed',
  },
})
