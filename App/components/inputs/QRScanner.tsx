import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, Dimensions } from 'react-native'

import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { mainColor } from '../../globalStyles'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  camera: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinder: {
    height: width - 0.25 * width,
    width: width - 0.25 * width,
    marginVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: mainColor,
    alignSelf: 'center',
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
  event: {
    left: 30 + 1,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  activeEvent: {
    color: 'black',
    backgroundColor: 'white',
    overflow: 'hidden',
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
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', maxWidth: '100%' }}>
              <View style={[styles.event, styles.activeEvent]}></View>
              <View
                style={{
                  borderLeftWidth: 2,
                  borderLeftColor: 'white',
                  marginLeft: 20,
                  paddingLeft: 20,
                  marginTop: 20,
                  zIndex: -1,
                }}
              >
                <Text style={{ color: 'white', paddingLeft: 10, paddingRight: 30, marginTop: -20, paddingBottom: 20 }}>
                  Scan the QR code issued by an organization to add a credential
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', maxWidth: '100%' }}>
              <View style={styles.event}></View>
              <View
                style={{
                  borderLeftWidth: 2,
                  borderLeftColor: 'white',
                  marginLeft: 20,
                  paddingLeft: 20,
                  marginTop: 20,
                  zIndex: -1,
                }}
              >
                <Text style={{ color: 'white', paddingLeft: 10, paddingRight: 30, marginTop: -20, paddingBottom: 20 }}>
                  Accept the offered credential
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', maxWidth: '100%' }}>
              <View style={styles.event}></View>
              <View
                style={{
                  marginLeft: 20,
                  paddingLeft: 20,
                  marginTop: 20,
                  zIndex: -1,
                }}
              >
                <Text style={{ color: 'white', paddingLeft: 10, paddingRight: 30, marginTop: -20 }}>
                  Done! Your new credential is added to your wallet
                </Text>
              </View>
            </View>
          </View>
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
        </RNCamera>
      )}
    </View>
  )
}

export default QRScanner
