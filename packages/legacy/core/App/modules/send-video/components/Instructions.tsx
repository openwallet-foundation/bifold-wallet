import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import Text from '../../../components/texts/Text'

const Instructions: React.FC = () => {
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    instructionContainer: {
      marginVertical: 5,
    },

    instructionItem: {
      fontSize: 18,
      fontFamily: 'Lato',
      color: '#F2F2F2',
      fontWeight: '500',
      lineHeight: 32,
    },
  })

  return (
    <View style={styles.instructionContainer}>
      <Text style={styles.instructionItem}>{t('SendVideo.Instructions.BeTheOnlyPersonInTheVideo')}</Text>
      <Text style={styles.instructionItem}>{t('SendVideo.Instructions.BeInQuitePlace')}</Text>
      <Text style={styles.instructionItem}>{t('SendVideo.Instructions.HoldTheDeviceInFrontOfYourFace')}</Text>
      <Text style={styles.instructionItem}>{t('SendVideo.Instructions.CheckYourFaceCanBeeSeenInTheVideo')}</Text>
      <Text style={styles.instructionItem}>{t('SendVideo.Instructions.SeeYourFirstAndLastName')}</Text>
    </View>
  )
}

export default Instructions
