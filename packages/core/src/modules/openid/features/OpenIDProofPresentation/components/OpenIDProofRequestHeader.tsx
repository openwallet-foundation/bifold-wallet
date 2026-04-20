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
  reason = ''
}) => {

  const { ListItems, TextTheme } = useTheme()
  const { t } = useTranslation()

    const styles = StyleSheet.create({
        headerTextContainer: {
            paddingVertical: 16,
        },
        headerText: {
            ...ListItems.recordAttributeText,
            flexShrink: 1,
            paddingBottom: 10,
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
