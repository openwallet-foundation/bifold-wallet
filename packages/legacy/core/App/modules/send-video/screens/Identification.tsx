/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-named-as-default-member */
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, ScrollView, TextInput, Text, Image, TouchableOpacity } from 'react-native'

import Button, { ButtonType } from '../../../components/buttons/Button'
import Title from '../../../components/texts/Title'
import { Screens, SendVideoStackParams } from '../types/navigators'
import { testIdWithKey } from '../../../utils/testable'

const Identification: React.FC<StackScreenProps<SendVideoStackParams, Screens.Identification>> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<SendVideoStackParams, Screens.CaptureCard>>()
  const { t } = useTranslation()
  const [identificationNumber, setIdentificationNumber] = useState('')
  const [frontCardImage, setFrontCardImage] = useState<string | null>(null)
  const [backCardImage, setBackCardImage] = useState<string | null>(null)
  const session = route.params.session

  const onPress = (type: string) => {
    navigation.navigate(Screens.CaptureCard, {
      type,
      // Set callback for when the image is captured
      onImageCaptured: (imagePath: string) => {
        const formattedPath = `file://${imagePath}`
        if (type === 'front') {
          setFrontCardImage(formattedPath)
        } else {
          setBackCardImage(formattedPath)
        }
      },
    })
  }

  const onStartRecording = () => {
    if (session) {
      navigation.navigate(Screens.CaptureVideo, {
        session: session,
        idNumber: identificationNumber,
        cardFrontImage: frontCardImage,
        cardBackImage: backCardImage,
      })
    }
  }

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    inputContainer: {
      backgroundColor: '#1c1c1c',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginVertical: 20,
      color: '#fff',
      borderColor: '#cecece',
      borderWidth: 1,
    },
    divider: {
      backgroundColor: '#cecece',
      height: 0.5,
      width: '100%',
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Lato',
      fontWeight: '600',
      color: '#fff',
      marginBottom: 8,
    },
    cardImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 16,
    },
    cardPlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: 'transparent',
      borderWidth: 3,
      borderColor: '#1c1c1c',
      borderStyle: 'dashed',
      borderRadius: 16,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: '#666',
      fontSize: 16,
      fontFamily: 'Lato',
    },
    imageLabelContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    editIconText: {
      color: 'white',
      fontSize: 14,
      width: 18,
    },
    subContainer: {
      width: '90%',
      marginTop: '10%',
      paddingBottom: '15%',
    },
    titleHeading: {
      fontSize: 30,
      fontFamily: 'Lato',
      fontWeight: '700',
    },
  })

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.subContainer}>
        <Title style={styles.titleHeading}>{t('SendVideo.Identification.EnterIdentificationNumber')}</Title>
        <TextInput
          style={styles.inputContainer}
          value={identificationNumber}
          placeholder="000000"
          onChangeText={setIdentificationNumber}
          keyboardType="numeric"
        />
        <View style={styles.divider} />
        <View style={styles.imageLabelContainer}>
          <Title style={styles.sectionTitle}>{t('SendVideo.Identification.FrontOfCard')}</Title>
          <Text style={styles.editIconText}>✎</Text>
        </View>
        <TouchableOpacity onPress={() => onPress('front')}>
          {frontCardImage ? (
            <Image source={{ uri: frontCardImage }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardPlaceholder}>
              <Text style={styles.placeholderText}>{t('SendVideo.Identification.ClickImage')}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.imageLabelContainer}>
          <Title style={styles.sectionTitle}>{t('SendVideo.Identification.BackOfCard')}</Title>
          <Text style={styles.editIconText}>✎</Text>
        </View>

        <TouchableOpacity onPress={() => onPress('back')}>
          {backCardImage ? (
            <Image source={{ uri: backCardImage }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardPlaceholder}>
              <Text style={styles.placeholderText}>{t('SendVideo.Identification.ClickImage')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          title={t('SendVideo.VideoInstructions.StartRecordingVideo')}
          accessibilityLabel={t('SendVideo.VideoInstructions.StartRecordingVideo')}
          testID={testIdWithKey('StartVideoRecording')}
          buttonType={ButtonType.Critical}
          onPress={onStartRecording}
        />
      </View>
    </ScrollView>
  )
}

export default Identification
