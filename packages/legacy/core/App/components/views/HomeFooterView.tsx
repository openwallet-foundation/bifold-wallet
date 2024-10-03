import { CredentialState } from '@credo-ts/core'
import { useAgent, useCredentialByState } from '@credo-ts/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import InactivityWrapper, { LockOutTime } from '../misc/InactivityWrapper'

const offset = 25

interface HomeFooterViewProps {
  children?: any
}

const HomeFooterView: React.FC<HomeFooterViewProps> = ({ children }) => {
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const [{ useNotifications }] = useServices([TOKENS.NOTIFICATIONS])
  const { agent } = useAgent()
  const notifications = useNotifications({})
  const { HomeTheme, TextTheme } = useTheme()
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
      borderColor: 'red',
      borderWidth: 1,
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
          {t('Home.YouHave')} <Text style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</Text>{' '}
          {t('Home.Credential')} {t('Home.InYourWallet')}
        </Text>
      )
    } else if (credentialCount > 1) {
      credentialMsg = (
        <Text>
          {t('Home.YouHave')} <Text style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</Text>{' '}
          {t('Home.Credentials')} {t('Home.InYourWallet')}
        </Text>
      )
    } else {
      credentialMsg = t('Home.NoCredentials')
    }

    return (
      <>
        <InactivityWrapper
          timeoutLength={LockOutTime.OneMinute}
          timeoutAction={async () => {
            console.log('Timeout has finished, close wallet')
            // await agent?.wallet.close()
          }}
        >
          {notifications.length === 0 && (
            <View style={styles.messageContainer}>
              <Text adjustsFontSizeToFit style={[HomeTheme.welcomeHeader, { marginTop: offset, marginBottom: 20 }]}>
                {t('Home.Welcome')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{ margin: 10, padding: 10, borderColor: 'blue', borderWidth: 1 }}
            onPress={() => {
              console.log('I was touched!')
            }}
          >
            <Text style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}>{credentialMsg}</Text>
          </TouchableOpacity>
        </InactivityWrapper>
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

export default HomeFooterView
