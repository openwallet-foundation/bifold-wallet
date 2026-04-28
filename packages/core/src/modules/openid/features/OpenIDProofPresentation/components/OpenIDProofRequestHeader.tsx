import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../../contexts/theme'
import { testIdWithKey } from '../../../../../utils/testable'
import { type SelectedCredentialsFormat } from '../../../types'

interface OpenIDProofRequestHeaderProps {
  selectedCredentialsSubmission?: SelectedCredentialsFormat
  verifierName: string
  reason: string
}

const OpenIDProofRequestHeader: React.FC<OpenIDProofRequestHeaderProps> = ({
  selectedCredentialsSubmission,
  verifierName = '',
  reason = '',
}) => {
  const { ListItems, TextTheme, Spacing } = useTheme()
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
      paddingBottom: Spacing.sm,
    },
  })

  if (!selectedCredentialsSubmission) return

  return (
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
        <Text style={TextTheme.normal}>{t('ProofRequest.ReceiveProofTitle')}</Text>
        <Text style={TextTheme.title}> ${verifierName}</Text>
      </Text>
      <Text style={TextTheme.normal}>{reason}</Text>
    </View>
  )
}

export default OpenIDProofRequestHeader
