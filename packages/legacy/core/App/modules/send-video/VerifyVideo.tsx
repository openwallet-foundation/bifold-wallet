/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-named-as-default-member */
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, View, ActivityIndicator, useWindowDimensions } from 'react-native'
import RNFS from 'react-native-fs'
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera'
import Button, { ButtonType } from '../../components/buttons/Button'
import Text from '../../components/texts/Text'
import Title from '../../components/texts/Title'
import { prompts } from './prompts'
import { testIdWithKey } from '../../utils/testable'

const endpoint = `http://localhost:3000`

const Scanner = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const camera = useRef<Camera | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [currentPrompt, setCurrentPrompt] = useState<number>(0)
  const [apiCall, setApiCall] = useState<boolean>(false)
  const [loader, setLoader] = useState<boolean>(false)
  const device = useCameraDevice('front')
  const screenAspectRatio = useWindowDimensions().scale
  const format = useCameraFormat(device, [
    { fps: 20 },
    { videoAspectRatio: screenAspectRatio },
    { videoResolution: 'max' },
  ])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },

    cameraWrapper: {
      flex: 1,
    },

    actionContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: '3%',
      width: '100%',
    },

    promptContainer: {
      width: '90%',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#606060',
      paddingBottom: '5%',
      marginBottom: '5%',
    },

    ovalContainer: {
      position: 'absolute',
      left: '15%',
      right: 0,
      borderWidth: 1.2,
      height: '45%',
      width: '70%',
      top: '20%',
      borderRadius: 100,
      borderColor: '#fff',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust the alpha value for transparency
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

    text: {
      marginVertical: 30,
    },

    loaderWrapper: {
      margin: 60,
    },

    step: {
      fontSize: 18,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '600',
      opacity: 0.8,
    },

    prompt: {
      fontSize: 26,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '700',
      marginVertical: '5%',
    },
  })

  useEffect(() => {
    if (device) {
      setTimeout(() => {
        startRecording()
      }, 3000)
    }
  }, [device])

  const createFileName = () => {
    const timestamp = new Date().getTime()
    const videoName = `${timestamp}.mp4`
    return videoName
  }

  const submitVideo = async (path: string) => {
    try {
      setApiCall(true)
      setLoader(true)
      setTimeout(() => {
        setLoader(false) //@todo will remove when real api will work
      }, 3000)
      const formData = new FormData()
      formData.append('video', {
        uri: `file://${path}`,
        type: 'video/mp4',
        name: createFileName(),
      })
      // Replace 'endpoint' with the actual endpoint where you want to send the video
      // const response = await axios.post(endpoint, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // console.log('API Response:', response?.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending video to API:', error)
    }
  }

  const saveVideoToFile = async (uri: string) => {
    try {
      const destinationPath = RNFS.ExternalDirectoryPath + '/' + createFileName()
      await RNFS.moveFile(uri, destinationPath)
      await submitVideo(destinationPath)
    } catch (error) {
      console.error('Error saving video:', error)
    }
  }

  const startRecording = async () => {
    if (device) {
      Alert.alert('Recording Started')
      setIsRecording(true)
      setIsRecording(true)
      camera.current?.startRecording({
        onRecordingFinished: async (video) => {
          await saveVideoToFile(video.path)
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error)
        },
      })
    }
  }

  const fetchNextPrompt = () => {
    if (currentPrompt < prompts.length - 1) {
      setCurrentPrompt((previousPrompt: number) => previousPrompt + 1)
    }
  }

  const stopRecording = async () => {
    if (device) {
      await camera.current?.stopRecording()
      setIsRecording(false)
      navigation.navigate('Submit Video' as never)
    }
  }

  return apiCall ? (
    <>
      <Title style={styles.text}>{t('SendVideo.Screens.ThankYou')}</Title>
      <Title style={styles.text}>{t('SendVideo.Screens.PleaseWaitWhileWeSubmitYourVideoVerification')}</Title>
      {loader && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size={'large'} color={'blue'} />
        </View>
      )}
      {!loader && (
        <Button
          title={t('SendVideo.Screens.SubmitYourResult')}
          accessibilityLabel={t('SendVideo.Screens.SubmitYourResult')}
          testID={testIdWithKey('SubmitYourResult')}
          buttonType={ButtonType.Secondary}
        />
      )}
    </>
  ) : (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        {device && (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            video={true}
            format={format}
            torch={'off'}
          />
        )}
      </View>
      {/* Oval Container with Basic Overlay */}
      <View style={styles.ovalContainer} />
      <View style={styles.overlay} />
      <View style={styles.actionContainer}>
        <View style={styles.promptContainer}>
          <Text style={styles.step}>{'Step ' + '' + (currentPrompt + 1)}</Text>

          <Text style={styles.prompt}>{prompts[currentPrompt]}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={currentPrompt < prompts.length - 1 ? t('SendVideo.Screens.Next') : t('SendVideo.Screens.Done')}
            accessibilityLabel={'secondary'}
            buttonType={ButtonType.Critical}
            onPress={currentPrompt < prompts.length - 1 ? fetchNextPrompt : stopRecording}
            disabled={!isRecording}
          />
        </View>
      </View>
    </View>
  )
}

export default Scanner
