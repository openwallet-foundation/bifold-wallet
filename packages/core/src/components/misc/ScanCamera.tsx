import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Vibration, View, useWindowDimensions, Pressable, GestureResponderEvent, Animated } from 'react-native'
import { OrientationType, useOrientationChange } from 'react-native-orientation-locker'
import { Camera, Code, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera'

import { QrCodeScanError } from '../../types/error'

export interface ScanCameraProps {
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
  torchActive?: boolean
}

const styles = StyleSheet.create({
  focusIndicator: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
})

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
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null)
  const focusOpacity = useRef(new Animated.Value(0)).current
  const focusScale = useRef(new Animated.Value(1)).current
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
  const dimensions = useWindowDimensions()
  console.log('Element Dimensions:', dimensions);
  console.log('Camera dimensions', camera.current?.width, device?.photoHeight);

  const screenToCameraSpace = (point: { x: number; y: number }): { x: number; y: number } => {
    //coordinate transformation if necessary
    return point
  }

  const drawFocusTap = async (point: { x: number; y: number }): Promise<void> => {
    // Draw a focus tap indicator on the camera preview
    setFocusPoint(point)
    
    focusOpacity.setValue(1)
    focusScale.setValue(1.5)
    
    Animated.parallel([
      Animated.timing(focusOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(focusScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFocusPoint(null)
    })
  }

  const handleFocusTap = (e: GestureResponderEvent): void => {
    if (!device?.supportsFocus) {
      return
    }
    const { locationX: x, locationY: y } = e.nativeEvent
    const tapPoint = { x, y }
    const focusPoint = screenToCameraSpace(tapPoint)
    // focus indicator is in screen space
    drawFocusTap(tapPoint)
    console.log('Tapped at:', x, y)
    focus(focusPoint)
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
                handleFocusTap(e)
              }
            }
          />
          {focusPoint && (
            <Animated.View
              style={[
                styles.focusIndicator,
                {
                  left: focusPoint.x - 40,
                  top: focusPoint.y - 40,
                  opacity: focusOpacity,
                  transform: [{ scale: focusScale }],
                },
              ]}
            />
          )}
        </>
      )}
    </View>
  )
}

export default ScanCamera
