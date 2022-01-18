import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, Vibration, View, StyleSheet } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'

import { Colors } from '../../Theme'

import QRScannerClose from 'components/misc/QRScannerClose'
import QRScannerTorch from 'components/misc/QRScannerTorch'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinder: {
    width: 250,
    height: 250,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#ffffff30',
  },
  viewFinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const CameraViewContainer: React.FC<{ portrait: boolean }> = ({ portrait, children }) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: portrait ? 'column' : 'row',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  )
}

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
  const navigation = useNavigation()
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)

  const { width, height } = useWindowDimensions()
  const portraitMode = height > width
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.container}
        type={RNCamera.Constants.Type.back}
        flashMode={torchActive ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: t('QRScanner.PermissionToUseCamera'),
          message: t('QRScanner.WeNeedYourPermissionToUseYourCamera'),
          buttonPositive: t('QRScanner.Ok'),
          buttonNegative: t('Global.Cancel'),
        }}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={(e) => {
          if (cameraActive) {
            Vibration.vibrate()
            setCameraActive(false)
            handleCodeScan(e)
          }
        }}
      >
        <CameraViewContainer portrait={portraitMode}>
          <QRScannerClose onPress={() => navigation.goBack()}></QRScannerClose>
          <View style={styles.viewFinderContainer}>
            <View style={styles.viewFinder} />
          </View>
          <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
        </CameraViewContainer>
      </RNCamera>
    </View>
  )
}

export default QRScanner
