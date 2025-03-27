import { CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'
import { ThemedText } from '../texts/ThemedText'

const offset = 25

interface HomeFooterViewProps {
  children?: any
}

const HomeFooterView: React.FC<HomeFooterViewProps> = ({ children }) => {
  const { openIdState } = useOpenIDCredentials()
  const { w3cCredentialRecords, sdJwtVcRecords } = openIdState
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
    ...w3cCredentialRecords,
    ...sdJwtVcRecords,
  ]
  const { HomeTheme, TextTheme, Assets } = useTheme()
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: offset,
      paddingBottom: offset * 3,
    },

    messageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: offset,
    },

    imageContainer: {
      alignItems: 'center',
      marginTop: 100,
    },
  })

  const displayMessage = (credentialCount: number) => {
    if (typeof credentialCount === 'undefined' && credentialCount >= 0) {
      throw new Error('Credential count cannot be undefined')
    }

    let credentialMsg
    let scanReminder

    if (credentialCount === 1) {
      credentialMsg = (
        <ThemedText>
          {t('Home.YouHave')}{' '}
          <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</ThemedText>{' '}
          {t('Home.Credential')} {t('Home.InYourWallet')}
        </ThemedText>
      )
    } else if (credentialCount > 1) {
      credentialMsg = (
        <ThemedText>
          {t('Home.YouHave')}{' '}
          <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>{credentialCount}</ThemedText>{' '}
          {t('Home.Credentials')} {t('Home.InYourWallet')}
        </ThemedText>
      )
    } else {
      credentialMsg = <ThemedText variant="bold">{t('Home.NoCredentials')}</ThemedText>
      scanReminder = <ThemedText>{t('Home.ScanOfferAddCard')}</ThemedText>
    }

    return (
      <>
        <View style={styles.imageContainer}>
          <Assets.svg.homeCenterImg {...{ width: '30%' }} />
        </View>

        <View style={styles.messageContainer}>
          <ThemedText
            adjustsFontSizeToFit
            style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}
          >
            {credentialMsg}
          </ThemedText>
        </View>

        <View style={styles.messageContainer}>
          <ThemedText
            adjustsFontSizeToFit
            style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}
          >
            {scanReminder}
          </ThemedText>
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

export default HomeFooterView
