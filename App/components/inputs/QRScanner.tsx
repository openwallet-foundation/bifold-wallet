import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'

import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { mainColor } from '../../globalStyles'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
}

const styles = StyleSheet.create({
  camera: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinder: {
    height: 250,
    width: 250,
    padding: 100,
    marginBottom: 100 - 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: mainColor,
  },
  torchButton: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'white',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  torchButtonOn: {
    backgroundColor: 'white',
  },
  torchButtonIcon: {
    marginLeft: 2,
    marginTop: 2,
  },
})

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
  const [active, setActive] = useState(true)
  const [torch, setTorch] = useState(false)

  useEffect(() => {
    if (!active) {
      setTimeout(() => setActive(true), 5000)
    }
  }, [active])

  return (
    <View style={styles.camera}>
      {active && (
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
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
        >
          <View>
            <View style={styles.viewFinder} />
            <TouchableWithoutFeedback
              style={[styles.torchButton, torch && styles.torchButtonOn]}
              onPress={() => setTorch(!torch)}
            >
              {torch ? (
                <Icon name="flash-on" color="black" size={24} style={[styles.torchButtonIcon]} />
              ) : (
                <Icon name="flash-off" color="white" size={24} style={styles.torchButtonIcon} />
              )}
            </TouchableWithoutFeedback>
          </View>
        </RNCamera>
      )}
    </View>
  )
}

export default QRScanner
