import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'

import { RNCamera } from 'react-native-camera'

interface Props {
  handleCodeScan: (event: any) => Promise<void>
}

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
  const [active, setActive] = useState(true)

  return (
    <View style={styles.camera}>
      {active && (
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
          onBarCodeRead={(e) => {
            setActive(false)
            handleCodeScan(e)
          }}
        />
      )}
      <View style={styles.viewFinder} />
    </View>
  )
}

export default QRScanner

const styles = StyleSheet.create({
  camera: {
    backgroundColor: 'black',
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
