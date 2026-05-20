import React from 'react'
import { StyleSheet, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../../../../contexts/theme'
import { OIDNotificationType } from '../OpenIDNotificationCard'
import CredentialCardGenLogo from '../../../../../components/misc/CredentialCardGenLogo'
import { CredentialDisplay } from '../../../types'

interface NotificationCardIconProps {
  credentialDisplay: Partial<CredentialDisplay>
  notificationType: OIDNotificationType
}

export function NotificationCardIcon({ credentialDisplay, notificationType }: NotificationCardIconProps) {

  const { Spacing, ColorPalette } = useTheme()

  const iconColor: Record<OIDNotificationType, string> = {
    CredentialRefresh: ColorPalette.brand.inlineWarning,
    CredentialExpired: ColorPalette.brand.inlineError,
  }

  const iconName: Record<OIDNotificationType, string> = {
    CredentialRefresh: 'add-circle',
    CredentialExpired: 'report'
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
      borderRadius: 12,
      backgroundColor: 'white',
    },
    icon: {
      zIndex: 3,
    },
    iconContainer: {
      position: 'absolute',
      top: -8,
      left: -8,
      zIndex: 2,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconFill: {
      position: 'absolute',
      height: 12,
      width: 12,
      zIndex: 2,
      backgroundColor: 'white'
    }
  })

  return (
    <View style={styles.imageContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconFill} />
        <Icon name={iconName[notificationType]} color={iconColor[notificationType]} style={styles.icon} size={25} />
      </View>
      <CredentialCardGenLogo
        containerStyle={styles.cardImage}
        logoHeight={50}
        noLogoText={credentialDisplay?.logo?.altText ?? ''}
        primaryBackgroundColor={credentialDisplay?.backgroundColor ?? '#FFFFFF'}
        logo={credentialDisplay?.logo?.uri ?? ''} 
      />
    </View>
  )
}
