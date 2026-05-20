import React, { useEffect, useState } from 'react'
import { StyleSheet, Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../../../contexts/theme'
import { ThemedText } from '../../../../components/texts/ThemedText'
import { CustomNotification } from '../../../../types/notification'
import { NotificationCardIcon } from './components/NotificationCardIcon'
import { useOpenIDCredentials } from '../../context/OpenIDCredentialRecordProvider'
import { getCredentialForDisplay } from '../../display'
import { CredentialDisplay } from '../../types'

export type OIDNotificationType = 'CredentialRefresh' | 'CredentialExpired'

interface OpenIDNotificationCardProps {
  notification: CustomNotification
  type: OIDNotificationType
}

export function OpenIDNotificationCard({ notification, type }: OpenIDNotificationCardProps) {

  const { TextTheme, ListItems, ColorPalette } = useTheme()
  const { t } = useTranslation()
  const { getCredentialById } = useOpenIDCredentials()
  const [credential, setCredential] = useState<Partial<CredentialDisplay> | undefined>()
  const id = notification?.metadata?.oldId
 
  useEffect(() => {
    
    const getCredentialData = async () => {
      const credential = await getCredentialById(id ?? '')
      return credential && getCredentialForDisplay(credential)
    }

    if(!id) return
    getCredentialData().then((credentialData) => {
      setCredential(credentialData?.display)
    })

  }, [notification, getCredentialById, type, setCredential])

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
      marginBottom: 4,
    },
    titleText: {
      ...TextTheme.title,
      marginBottom: 8
    },
    ctaText: {
      ...ListItems.recordLink,
      textDecorationStyle: 'solid',
      textDecorationLine: 'underline',
    },
    closeIcon: {
      position: 'absolute',
      top: -5,
      right: -5,
      height: 25,
      width: 25,
    }
  })

  if (!credential) return

  return (
    <Pressable onPress={notification.onPressAction} style={styles.pressable}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <NotificationCardIcon credentialDisplay={credential ?? {}} notificationType={type} />
        </View>
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.dateText}>{`${moment(notification?.createdAt ?? Date.now()).format('DD MMMM YYYY')}`}</ThemedText>
          <ThemedText style={styles.titleText}>{t(`OpenIDNotification.${type}.Title`, { cardName: credential?.name })}</ThemedText>
          {type === 'CredentialRefresh' && <ThemedText style={styles.ctaText}>{t(`OpenIDNotification.${type}.CTA`)}</ThemedText>}
        </View>
        {type === 'CredentialExpired' &&
          <Pressable style={styles.closeIcon} hitSlop={10} onPress={notification.onCloseAction}>
            <Icon size={25} name="close" color={ColorPalette.brand.headerIcon}/>
          </Pressable>
        }
      </View>
    </Pressable>
  )
}
