import React from 'react'
import { Image, StyleSheet, Pressable, useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../contexts/theme'
import { ThemedText } from '../../../components/texts/ThemedText'
import { CustomNotification } from '../../../types/notification'
import { getOpenIDCredentialById } from '../credentialRecord'
import { useOpenIdReplacementNavigation } from '../hooks/useOpenIdReplacementNavigation'
import { useAgent } from '@bifold/react-hooks'
import { useServices, TOKENS } from '../../../container-api'

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
  const { agent } = useAgent()
  const openReplacementOffer = useOpenIdReplacementNavigation()
  const replacementId = notification?.metadata?.['replacementId'] as string | undefined
  const [orchestrator] = useServices([TOKENS.UTIL_REFRESH_ORCHESTRATOR])
  console.log(notification?.metadata)
  const oldId = notification?.metadata?.['oldId'] as string | undefined
  const newCred = orchestrator.resolveFull(oldId)

  console.log(newCred)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
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
      marginBottom: Spacing.sm,
    },
    titleText: {
      ...TextTheme.headingFour,
      marginBottom: 8,
    },
    ctaText: {
      ...ListItems.recordLink,
      textDecorationStyle: 'solid',
      textDecorationLine: 'underline',
    }
  })

  return (
    <Pressable onPress={() => openReplacementOffer(notification)}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image resizeMode='center' src={image} height={50} width={50} style={{ backgroundColor: 'red', borderRadius: Spacing.sm }} />
        </View>
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.dateText}>{`${notification.createdAt}`}</ThemedText>
          <ThemedText style={styles.titleText}>{t(`OpenIDNotification.${type}.Title`)}</ThemedText>
          <ThemedText style={styles.ctaText}>{t(`OpenIDNotification.${type}.CTA`)}</ThemedText>
        </View>
      </View>
    </Pressable>
  )
}
