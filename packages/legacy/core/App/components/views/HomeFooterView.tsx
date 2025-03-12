import { CredentialState } from '@credo-ts/core'
import { useCredentialByState } from '@credo-ts/react-hooks'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { useOpenIDCredentials } from '../../modules/openid/context/OpenIDCredentialRecordProvider'

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
      credentialMsg = <Text style={[TextTheme.bold]}>{t('Home.NoCredentials')}</Text>
      scanReminder = <Text>{t('Home.ScanOfferAddCard')}</Text>
    }

    return (
      <>
        <View style={styles.imageContainer}>
          <Assets.svg.homeCenterImg {...{ width: '30%' }} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}>{credentialMsg}</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={[HomeTheme.credentialMsg, { marginTop: offset, textAlign: 'center' }]}>{scanReminder}</Text>
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
