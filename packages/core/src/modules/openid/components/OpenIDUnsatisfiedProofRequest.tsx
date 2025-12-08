import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import InfoBox, { InfoBoxType } from '../../../components/misc/InfoBox'
import { ThemedText } from '../../../components/texts/ThemedText'

type OpenIDUnsatisfiedProofRequestProps = {
  verifierName?: string
  credentialName?: string
  requestPurpose?: string
}

const OpenIDUnsatisfiedProofRequest: React.FC<OpenIDUnsatisfiedProofRequestProps> = ({
  verifierName,
  credentialName,
  requestPurpose,
}) => {
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingTop: 30,
      paddingHorizontal: 16,
    },
    textContainer: {
      flex: 1,
      paddingHorizontal: 8,
    },
    verifierDetailsText: {
      marginTop: 30,
    },
    verifierNameText: {
      marginTop: 8,
      marginBottom: 30,
    },
    credentialDetailsText: {
      marginTop: 8,
    },
  })

  return (
    <View style={styles.container}>
      <InfoBox
        title={t('UnsatisfiedProofRequest.InfoBox.Title')}
        message={t('UnsatisfiedProofRequest.InfoBox.Subtitle', { verifierName })}
        notificationType={InfoBoxType.Error}
        renderShowDetails
      />
      <View style={styles.textContainer}>
        <ThemedText variant="normal" style={styles.verifierDetailsText}>
          {t('UnsatisfiedProofRequest.VerifierDetail')}
        </ThemedText>
        <ThemedText variant="bold" style={styles.verifierNameText}>
          {verifierName}
        </ThemedText>
        <ThemedText variant="bold">{credentialName}</ThemedText>
        <ThemedText variant="normal" style={styles.credentialDetailsText}>
          {t('UnsatisfiedProofRequest.RequestPurpose', { requestPurpose })}
        </ThemedText>
      </View>
    </View>
  )
}

export default OpenIDUnsatisfiedProofRequest
