import React from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../../../../contexts/theme'
import { OIDNotificationType } from '../OpenIDNotificationCard'

interface NotificationCardIcon {
  image: string
  notificationType: OIDNotificationType
}

export function NotificationCardIcon({ image, notificationType }: NotificationCardIcon) {

  const { Spacing, ColorPalette } = useTheme()

  const iconColour: Record<OIDNotificationType, string> = {
    CredentialRefresh: ColorPalette.notification.warn,
    CredentialEOL: ColorPalette.notification.error,
  }

  const iconName: Record<OIDNotificationType, string> = {
    CredentialRefresh: 'add-circle',
    CredentialEOL: 'add-circle'
  }

  const styles = StyleSheet.create({
    imageContainer: {
      height: 50,
      width: 50,
      borderRadius: Spacing.sm,
    },
    cardImage: {
      height: 50,
      width: 50,
      backgroundColor: 'white',
      borderRadius: 12,
    }
  })

  return (
    <View style={styles.imageContainer}>
      <ImageBackground resizeMode='center' src={image} style={styles.cardImage}>
        <Icon name={iconColour[notificationType]} color={iconName[notificationType]} style={styles.icon} size={50} />
      </ImageBackground>
    </View>
  )
}
