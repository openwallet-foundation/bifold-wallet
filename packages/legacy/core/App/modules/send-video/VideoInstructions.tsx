import { useNavigation } from '@react-navigation/core'
import { StackScreenProps, StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import Actions from './Actions'
import Instructions from './Instructions'
import Button, { ButtonType } from '../../components/buttons/Button'
import Title from '../../components/texts/Title'
import { SendVideoStackParams, Screens } from './types/navigators'
import { testIdWithKey } from '../../utils/testable'

type VideoInstructionsProps = StackScreenProps<SendVideoStackParams, Screens.VideoInstructions>

const VideoInstructions: React.FC<VideoInstructionsProps> = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<SendVideoStackParams>>()
  const onPress = () => {
    navigation.navigate(Screens.VerifyVideo)
  }
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },

    instructionService: {
      fontSize: 18,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '600',
      lineHeight: 28,
    },

    warningTextContainer: {
      width: '80%',
      bottom: '2.5%',
    },

    centeredIcon: {
      paddingTop: '5%',
      marginVertical: '8%',
      alignItems: 'flex-start',
      backgroundColor: '#313132',
      borderWidth: 1,
      borderColor: '#E2CF51',
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingBottom: 10,
    },

    instructionHeading: {
      fontSize: 22,
      fontFamily: 'Lato',
      marginVertical: '5%',
    },

    titleVideo: {
      marginVertical: 10,
      textAlign: 'left',
      fontSize: 18,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '400',
      lineHeight: 24,
    },

    subContainer: {
      width: '90%',
      marginTop: '10%',
      paddingBottom: '15%',
    },

    titleHeading: {
      fontSize: 31,
      fontFamily: 'Lato',
    },

    topInfoContainer: {
      marginTop: '10%',
      borderBottomWidth: 1,
      borderBottomColor: '#606060',
      paddingBottom: '5%',
    },

    topInfoHeading: {
      fontSize: 18,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      opacity: 0.8,
      fontWeight: '600',
    },

    instructionsContainer: {
      marginTop: '5%',
    },
  })

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.subContainer}>
        <Title style={styles.titleHeading}>{t('SendVideo.VideoInstructions.RecordAShortVideo')}</Title>

        <View style={styles.topInfoContainer}>
          <Title style={styles.topInfoHeading}>{t('SendVideo.VideoInstructions.YouWillBeAskedToDo')}</Title>
          <Actions />
        </View>

        <View style={styles.instructionsContainer}>
          <Title style={styles.instructionService}>{t('SendVideo.VideoInstructions.PersonAtServiceBC')}</Title>

          <Title style={styles.instructionHeading}>{t('SendVideo.VideoInstructions.YouShould')}:</Title>

          <Instructions />
        </View>

        <View style={styles.centeredIcon}>
          <Icon name="alert" size={30} color="#FCBA12" />
          <View style={styles.warningTextContainer}>
            <Title style={[styles.titleVideo, { width: '100%', fontWeight: '600' }]}>Important</Title>
            <Title style={styles.titleVideo}>{t('SendVideo.VideoInstructions.VideosWithInappropriateOffensive')}</Title>
          </View>
        </View>
        <Button
          title={t('SendVideo.VideoInstructions.StartRecordingVideo')}
          accessibilityLabel={t('SendVideo.VideoInstructions.StartRecordingVideo')}
          testID={testIdWithKey('StartVideoRecording')}
          buttonType={ButtonType.Secondary}
          onPress={onPress}
        />
      </View>
    </ScrollView>
  )
}

export default VideoInstructions
