import { useNavigation } from '@react-navigation/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { Camera, useCameraDevice } from 'react-native-vision-camera'

import Button, { ButtonType } from '../../../components/buttons/Button'
import Text from '../../../components/texts/Text'
import Title from '../../../components/texts/Title'
import { Screens, SendVideoStackParams } from '../types/navigators'
import Toast from 'react-native-toast-message'

const CaptureCard: React.FC<StackScreenProps<SendVideoStackParams, Screens.CaptureCard>> = ({ route }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const camera = useRef<Camera | null>(null)
  const device = useCameraDevice('back')
  const type = route?.params?.type
  const onImageCaptured = route?.params?.onImageCaptured

  const capturePhoto = async () => {
    try {
      const capturedImage = await camera.current?.takePhoto()

      if (capturedImage?.path && onImageCaptured) {
        onImageCaptured(capturedImage?.path)
      }

      navigation.goBack()
    } catch (error) {
      Toast.show({
        type: 'error',
        autoHide: true,
        text1: 'Error',
      })
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    cameraWrapper: {
      flex: 7,
    },
    subContainer: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      flex: 3,
    },
    actionContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: '3%',
      width: '100%',
    },
    sectionTitle: {
      fontSize: 24,
      fontFamily: 'Lato',
      fontWeight: '700',
      color: '#fff',
      marginBottom: 8,
      marginTop: 10,
    },
    ovalContainer: {
      position: 'absolute',
      left: '3%',
      right: '3%',
      borderWidth: 5,
      height: '35%',
      width: '94%',
      top: '20%',
      borderColor: '#32674e',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,

      position: 'absolute',
      left: '15%',
      right: 0,
      height: '45%',
      width: '70%',
      top: '20%',
      borderRadius: 100,
    },
    buttonContainer: {
      width: '90%',
    },
    step: {
      fontSize: 16,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '600',
      opacity: 0.8,
      marginTop: '8%',
    },
  })

  useEffect(() => {
    // Set the callback dynamically using navigation.setOptions
    navigation.setOptions({
      onImageCaptured: route.params?.onImageCaptured, // Safely access the callback
    })
  }, [route.params?.onImageCaptured, navigation])

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        {device && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={false}
            photo={true}
            torch={'off'}
          />
        )}
      </View>
      <View style={styles.subContainer}>
        <Text style={styles.step}> {type === 'front' ? 'Step 1' : 'Step 2'}</Text>
        <Title style={styles.sectionTitle}>
          {type === 'front' ? t('SendVideo.Identification.FrontOfCard') : t('SendVideo.Identification.BackOfCard')}
        </Title>
      </View>

      <View style={styles.ovalContainer} />
      <View style={styles.overlay} />
      <View style={styles.actionContainer}>
        <View style={styles.buttonContainer}>
          <Button
            title={t('SendVideo.Screens.Next')}
            accessibilityLabel={'secondary'}
            buttonType={ButtonType.Critical}
            onPress={capturePhoto}
          />
        </View>
      </View>
    </View>
  )
}

export default CaptureCard
