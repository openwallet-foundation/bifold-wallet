import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { useTheme } from '../../../../contexts/theme'
import { ThemedText } from '../../../../components/texts/ThemedText'
import { CustomNotification } from '../../../../types/notification'
import { NotificationCardIcon } from './components/NotificationCardIcon'

export type OIDNotificationType = 'CredentialRefresh' | 'CredentialEOL'

interface OpenIDNotificationCardProps {
  notification: CustomNotification
  type: OIDNotificationType
}

export function OpenIDNotificationCard({ notification, type }: OpenIDNotificationCardProps) {
  const { TextTheme, ListItems } = useTheme()
  const { t } = useTranslation()

  console.log(notification)

  const styles = StyleSheet.create({
    pressable: {
      flex: 1,
    },
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailsContainer: {
      flexDirection: 'column',
      flex: 4,
    },
    dateText: {
      ...TextTheme.caption,
      marginBottom: 10,
    },
    titleText: {
      ...TextTheme.title,
      marginBottom: 15,
    },
    ctaText: {
      ...ListItems.recordLink,
      textDecorationStyle: 'solid',
      textDecorationLine: 'underline',
    }
  })

  return (
    <Pressable onPress={notification.onPressAction} style={styles.pressable}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <NotificationCardIcon image={''} notificationType={type} />
        </View>
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.dateText}>{`${moment(notification?.createdAt ?? Date.now()).format('DD MMMM YYYY')}`}</ThemedText>
          <ThemedText style={styles.titleText}>{t(`OpenIDNotification.${type}.Title`)}</ThemedText>
          <ThemedText style={styles.ctaText}>{t(`OpenIDNotification.${type}.CTA`)}</ThemedText>
        </View>
      </View>
    </Pressable>
  )
}
