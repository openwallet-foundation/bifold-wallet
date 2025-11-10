import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Vibration,
  View,
  useWindowDimensions,
  Pressable,
  GestureResponderEvent,
  Animated,
} from 'react-native'
import { OrientationType, useOrientationChange } from 'react-native-orientation-locker'
import { Camera, Code, useCameraDevice, useCameraFormat, useCodeScanner } from 'react-native-vision-camera'

import { QrCodeScanError } from '../../types/error'
import { testIdWithKey } from '../../utils/testable'

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
  const camera = useRef<Camera>(null)
  const dimensions = useWindowDimensions()
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

  const screenToCameraSpace = useCallback(
    (camera: Camera | null, point: { x: number; y: number }): { x: number; y: number } => {
      // transforms point from screen space to camera space based on camera and view dimensions
      // camera and view both define the top left as (0,0) so this is a simple scaling operation
      if (!camera) {
        return point
      }
      const frameWidth = camera.props.format?.videoWidth
      const frameHeight = camera.props.format?.videoHeight
      const viewWidth = dimensions.width
      const viewHeight = dimensions.height

      if (!frameWidth || !frameHeight) {
        // If video frame dimensions are undefined, return the original point
        return point
      }

      return {
        x: (point.x / viewWidth) * frameWidth,
        y: (point.y / viewHeight) * frameHeight,
      }
    },
    [dimensions]
  )

  const focus = useCallback(
    (point: { x: number; y: number }) => {
      const c = camera.current
      if (c) {
        c.focus(screenToCameraSpace(c, point))
      }
    },
    [screenToCameraSpace]
  )

  const handleFocusTap = (e: GestureResponderEvent): void => {
    if (!device?.supportsFocus) {
      return
    }
    const { locationX: x, locationY: y } = e.nativeEvent
    const tapPoint = { x, y }
    const focusPoint = screenToCameraSpace(camera.current, tapPoint)
    drawFocusTap(tapPoint)
    focus(focusPoint)
  }

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
            style={StyleSheet.absoluteFillObject}
            device={device}
            torch={torchActive ? 'on' : 'off'}
            isActive={cameraActive}
            codeScanner={codeScanner}
            format={format}
          />
          <Pressable
            testID={testIdWithKey('ScanCameraTapArea')}
            style={StyleSheet.absoluteFill}
            onPressIn={(e) => {
              handleFocusTap(e)
            }}
          />
          {focusPoint && (
            <Animated.View
              testID={testIdWithKey('FocusIndicator')}
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
