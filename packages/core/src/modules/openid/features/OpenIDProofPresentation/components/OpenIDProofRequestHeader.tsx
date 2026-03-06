import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../../../contexts/theme'
import { testIdWithKey } from '../../../../../utils/testable'
import { type SelectedCredentialsFormat } from '../../../types'

interface OpenIDProofRequestHeaderProps {
  selectedCredentialsSubmission?: SelectedCredentialsFormat
  verifierName: string
}

const OpenIDProofRequestHeader: React.FC<OpenIDProofRequestHeaderProps> = ({
  selectedCredentialsSubmission,
  verifierName = '',
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
        },
    })

    if (!selectedCredentialsSubmission) return

    return (
        <View style={styles.headerTextContainer}>
        <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Text style={TextTheme.normal}>{t('ProofRequest.ReceiveProofTitle')}</Text>
            {'\n'}
          <Text style={TextTheme.title}>{verifierName}</Text>
        </Text>
        </View>
    )
}

export default OpenIDProofRequestHeader
