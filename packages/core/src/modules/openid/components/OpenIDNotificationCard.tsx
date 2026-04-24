import React from 'react'
import { Image, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../contexts/theme'
import { ThemedText } from '../../../components/texts/ThemedText'
import { CustomNotification } from '../../../types/notification'

interface OpenIDNotificationCardProps {
  cardName: string
  date?: string
  onPress?(): void
  notification: CustomNotification
  type: 'CredentialRefresh' | 'CredentialEOL'
  image: any
}

export function OpenIDNotificationCard({ notification, onPress, type, image }: OpenIDNotificationCardProps) {
  const { TextTheme, Spacing, ListItems } = useTheme()
  const { t } = useTranslation()

  console.log(notification)


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      padding: Spacing.sm
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailsContainer: {
      flexDirection: 'column',
      flex: 4,
      justifyContent: 'space-between',
    },
    dateText: {
      ...TextTheme.caption,
    },
    titleText: {
      ...TextTheme.headingFour,
      marginBottom: Spacing.md,
    },
    ctaText: {
      ...ListItems.recordLink,
    }
  })

  return (
    <Pressable onPress={notification?.onPressAction}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image resizeMode='center' src={image} height={50} width={50} />
        </View>
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.dateText}>{`${notification.createdAt}`}</ThemedText>
          <ThemedText style={styles.dateText}>{t(`OpenIDNotification.${type}.Title`)}</ThemedText>
          <ThemedText style={styles.dateText}>{t(`OpenIDNotification.${type}.CTA`)}</ThemedText>
        </View>
      </View>
    </Pressable>
  )
}
