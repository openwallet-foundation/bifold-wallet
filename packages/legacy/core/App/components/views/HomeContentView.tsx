import { CredentialState } from '@aries-framework/core'
import { useCredentialByState } from '@aries-framework/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { useNotifications } from '../../hooks/notifications'

const offset = 25

interface HomeContentViewProps {
  children?: any
}

const HomeContentView: React.FC<HomeContentViewProps> = ({ children }) => {
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const notifications = useNotifications()
  const { HomeTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: offset,
      paddingBottom: offset * 3,
    },

    messageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 35,
      marginHorizontal: offset,
    },
  })

  const displayMessage = (credentialCount: number) => {
    if (typeof credentialCount === 'undefined' && credentialCount >= 0) {
      throw new Error('Credential count cannot be undefined')
    }

    let credentialMsg

    if (credentialCount === 1) {
      credentialMsg = (
        <Text>
          {t('Home.YouHave')} <Text style={{ fontWeight: 'bold' }}>{credentialCount}</Text> {t('Home.Credential')}{' '}
          {t('Home.InYourWallet')}
        </Text>
      )
    } else if (credentialCount > 1) {
      credentialMsg = (
        <Text>
          {t('Home.YouHave')} <Text style={{ fontWeight: 'bold' }}>{credentialCount}</Text> {t('Home.Credentials')}{' '}
          {t('Home.InYourWallet')}
        </Text>
      )
    } else {
      credentialMsg = t('Home.NoCredentials')
    }

    return (
      <>
        {notifications.total === 0 && (
          <View style={[styles.messageContainer]}>
            <Text adjustsFontSizeToFit style={[HomeTheme.welcomeHeader, { marginTop: offset, marginBottom: 20 }]}>
              {t('Home.Welcome')}
            </Text>
          </View>
        )}
        <View style={[styles.messageContainer]}>
          <Text style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}>{credentialMsg}</Text>
        </View>
      </>
    )
  }

  return (
    <View>
      <View style={styles.container}>{displayMessage(credentials.length)}</View>
      {children}
    </View>
  )
}

export default HomeContentView
