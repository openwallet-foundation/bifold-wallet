/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-named-as-default-member */
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, ActivityIndicator } from 'react-native'

import Title from '../../components/texts/Title'

const SubmitVideo: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const styles = StyleSheet.create({
    text: {
      marginVertical: 10,
      textAlign: 'center',
      fontFamily: 'Lato',
      fontSize: 31,
      marginTop: '10%',
    },

    loaderWrapper: {
      marginTop: '50%',
    },
  })

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      })
    }, 3000)
  }, [])

  return (
    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
      <View style={styles.loaderWrapper}>
        {isLoading ? (
          <>
            <ActivityIndicator size={'large'} color={'#42803E'} />
            <Title style={styles.text}>Uploading</Title>
          </>
        ) : (
          <>
            <Title style={styles.text}>{t('SendVideo.Screens.ThankYou')}</Title>
            <Title style={{ ...styles.text, fontSize: 16, color: '#F2F2F2' }}>
              {t('SendVideo.Screens.PleaseWaitWhileWeSubmitYourVideoVerification')}
            </Title>
          </>
        )}
      </View>
    </View>
  )
}

export default SubmitVideo
