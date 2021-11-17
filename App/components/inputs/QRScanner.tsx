import React, { useState } from 'react'
import { useWindowDimensions, Vibration, View, StyleSheet } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'

import { mainColor } from '../../globalStyles'

import QRScannerTorch from 'components/misc/QRScannerTorch'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinder: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: mainColor,
    backgroundColor: '#ffffff30',
  },
})

const CameraViewContainer: React.FC<{ portrait: boolean }> = ({ portrait, children }) => {
  return <View style={{ width: '100%', height: '100%', flexDirection: portrait ? 'column' : 'row' }}>{children}</View>
}

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)

  const { width, height } = useWindowDimensions()
  const portraitMode = height > width

  return (
    <View>
      {cameraActive && (
        <RNCamera
          style={styles.container}
          type={RNCamera.Constants.Type.back}
          flashMode={torchActive ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={(e) => {
            Vibration.vibrate()
            setCameraActive(false)
            handleCodeScan(e)
          }}
        >
          <CameraViewContainer portrait={portraitMode}>
            <View style={styles.viewFinder} />
            <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
          </CameraViewContainer>
        </RNCamera>
      )}
    </View>
  )
}

export default QRScanner
