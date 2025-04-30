import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

const PushNotificationsDisabledContent: React.FC = () => {
  const { t } = useTranslation()
  const { TextTheme } = useTheme()
  const settingsInstructions = [
    t('PushNotifications.InstructionsOne'),
    t('PushNotifications.InstructionsTwo'),
    t('PushNotifications.InstructionsThree'),
  ]

  const style = StyleSheet.create({
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
      <ThemedText variant="headingThree" style={style.heading}>
        {t('PushNotifications.EnableNotifications')}
      </ThemedText>
      <ThemedText>{t('PushNotifications.NotificationsOffMessage')}</ThemedText>
      <View>
        <ThemedText variant="bold">{t('PushNotifications.NotificationsOffTitle')}</ThemedText>
        <ThemedText>{t('PushNotifications.NotificationsInstructionTitle')}</ThemedText>
        {settingsInstructions.map((item, index) => (
          <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
            <ThemedText>{`${index + 1}. `}</ThemedText>
            <ThemedText style={style.listItem}>{item}</ThemedText>
          </View>
        ))}
      </View>
    </>
  )
}

export default PushNotificationsDisabledContent
