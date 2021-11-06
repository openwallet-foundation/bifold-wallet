import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'

import { RNCamera } from 'react-native-camera'

import { mainColor } from '../../globalStyles'

interface Props {
  handleCodeScan: (event: any) => Promise<void>
}

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
  const { t } = useTranslation()

  const [active, setActive] = useState(true)

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
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: t('QRScanner.permissionToUseCamera'),
            message: t('QRScanner.weNeedYourPermissionToUseYourCamera'),
            buttonPositive: t('QRScanner.ok'),
            buttonNegative: t('QRScanner.cancel'),
          }}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={(e) => {
            setActive(false)
            handleCodeScan(e)
          }}
        >
          <View style={styles.viewFinder} />
        </RNCamera>
      )}
    </View>
  )
}

export default QRScanner

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
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: mainColor,
  },
})
