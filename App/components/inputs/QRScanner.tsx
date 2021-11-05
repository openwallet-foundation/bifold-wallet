import styled, { css } from '@emotion/native'
import React, { useState } from 'react'
import { useWindowDimensions, Vibration, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'

import { mainColor } from '../../globalStyles'

import QRScannerTorch from 'components/misc/QRScannerTorch'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
}

const container = css`
  background-color: #000000;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
`

const Container = styled.View`
  ${container}
`

const ViewFinderContainer = styled.View`
  flex: 3;
  justify-content: center;
  align-items: center;
`

const ViewFinder = styled.View`
  width: 250px;
  height: 250px;
  border-radius: 24px;
  border: 2px solid ${mainColor};
  background-color: #ffffff30;
`

const CameraViewContainer: React.FC<{ portrait: boolean }> = ({ portrait, children }) => {
  return (
    <View
      style={css`
        width: 100%;
        height: 100%;
        flex-direction: ${portrait ? 'column' : 'row'};
      `}
    >
      {children}
    </View>
  )
}

const QRScanner: React.FC<Props> = ({ handleCodeScan }) => {
<<<<<<< HEAD
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)
=======
  const [active, setActive] = useState(true)
  const { t } = useTranslation()
>>>>>>> c5ba334 (Work on i18n string extraction)

  const { width, height } = useWindowDimensions()
  const portraitMode = height > width

  return (
    <Container>
      {cameraActive && (
        <RNCamera
          style={container}
          type={RNCamera.Constants.Type.back}
          flashMode={torchActive ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: t('Permission to use camera'),
            message: t('We need your permission to use your camera'),
            buttonPositive: t('Ok'),
            buttonNegative: t('Cancel'),
          }}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={(e) => {
            Vibration.vibrate()
            setCameraActive(false)
            handleCodeScan(e)
          }}
        >
          <CameraViewContainer portrait={portraitMode}>
            <ViewFinderContainer>
              <ViewFinder />
            </ViewFinderContainer>
            <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
          </CameraViewContainer>
        </RNCamera>
      )}
    </Container>
  )
}

export default QRScanner
