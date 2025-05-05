import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

const PushNotificationsContent: React.FC = () => {
  const { t } = useTranslation()
  const { TextTheme, Assets } = useTheme()
  const list = [
    t('PushNotifications.BulletOne'),
    t('PushNotifications.BulletTwo'),
    t('PushNotifications.BulletThree'),
    t('PushNotifications.BulletFour'),
  ]

  const style = StyleSheet.create({
    image: {
      height: 200,
      marginBottom: 20,
    },
    heading: {
      marginBottom: 20,
    },
    listItem: {
      ...TextTheme.normal,
      flex: 1,
      paddingLeft: 5,
    },
  })

  return (
    <>
      <View style={style.image}>
        <Assets.svg.pushNotificationImg />
      </View>
      <ThemedText variant="headingThree" style={style.heading}>
        {t('PushNotifications.EnableNotifications')}
      </ThemedText>
      <ThemedText>{t('PushNotifications.BeNotified')}</ThemedText>
      {list.map((item, index) => (
        <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
          <ThemedText>{'\u2022'}</ThemedText>
          <ThemedText style={style.listItem}>{item}</ThemedText>
        </View>
      ))}
    </>
  )
}

export default PushNotificationsContent
