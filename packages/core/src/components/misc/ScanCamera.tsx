import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Vibration, View, useWindowDimensions, Pressable } from 'react-native'
import { OrientationType, useOrientationChange } from 'react-native-orientation-locker'
import { Camera, Code, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera'

import { QrCodeScanError } from '../../types/error'

export interface ScanCameraProps {
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
  torchActive?: boolean
}

const ScanCamera: React.FC<ScanCameraProps> = ({ handleCodeScan, error, enableCameraOnError, torchActive }) => {
  const [orientation, setOrientation] = useState(OrientationType.PORTRAIT)
  const [cameraActive, setCameraActive] = useState(true)
  const orientationDegrees: { [key: string]: string } = {
    [OrientationType.PORTRAIT]: '0deg',
    [OrientationType['LANDSCAPE-LEFT']]: '270deg',
    [OrientationType['PORTRAIT-UPSIDEDOWN']]: '180deg',
    [OrientationType['LANDSCAPE-RIGHT']]: '90deg',
  }
  const [invalidQrCodes, setInvalidQrCodes] = useState(new Set<string>())
  const device = useCameraDevice('back')
  const screenAspectRatio = useWindowDimensions().scale
  const format = useCameraFormat(device, [
    { fps: 20 },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
    { photoAspectRatio: screenAspectRatio },
    { photoResolution: 'max' },
  ])
  useOrientationChange((orientationType) => {
    setOrientation(orientationType)
  })

  const onCodeScanned = useCallback(
    (codes: Code[]) => {
      const value = codes[0].value
      if (!value || invalidQrCodes.has(value)) {
        return
      }

      if (error?.data === value) {
        setInvalidQrCodes((prev) => new Set([...prev, value]))
        if (enableCameraOnError) {
          return setCameraActive(true)
        }
      }

      if (cameraActive) {
        Vibration.vibrate()
        handleCodeScan(value)
        return setCameraActive(false)
      }
    },
    [invalidQrCodes, error, enableCameraOnError, cameraActive, handleCodeScan]
  )

  const camera = useRef<Camera>(null)

  const screenToCameraSpace = (point: { x: number; y: number }) => {
    //coordinate transformation
    return point
  }

  const focus = useCallback((point: { x: number; y: number }) => {
    const c = camera.current
    if (c) {
      console.log('Focusing at:', point)
      // need to transform point from screen space to camera space
      c.focus(screenToCameraSpace(point))
    }
  }, [])

  useEffect(() => {
    if (error?.data && enableCameraOnError) {
      setCameraActive(true)
    }
  }, [error, enableCameraOnError])

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: onCodeScanned,
  })
  // log device info
  console.log('Camera Device Info:', JSON.stringify(device, null, 2))

  return (
    <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: orientationDegrees[orientation] ?? '0deg' }] }]}>
      {device && (
        <>
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            torch={torchActive ? 'on' : 'off'}
            isActive={cameraActive}
            codeScanner={codeScanner}
            format={format}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPressIn={
              (e) => {
                if (!device?.supportsFocus) {
                  return
                }
                const { locationX: x, locationY: y } = e.nativeEvent
                console.log('Tapped at:', x, y)
                focus({ x, y })
              }
            }
          />
        </>
      )}
    </View>
  )
}

export default ScanCamera
