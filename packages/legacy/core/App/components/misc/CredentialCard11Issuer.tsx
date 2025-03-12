import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { Text, View } from 'react-native'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import { useTranslation } from 'react-i18next'
import React from 'react'

interface Props {
  overlay: CredentialOverlay<BrandingOverlay>
  overlayType: BrandingOverlayType
  hasBody: boolean
  proof?: boolean
}

const CredentialIssuerBody: React.FC<Props> = ({ overlay, overlayType, hasBody, proof }: Props) => {
  const isBranding10 = overlayType === BrandingOverlayType.Branding10
  const { TextTheme } = useTheme()
  const { styles } = useCredentialCardStyles(overlay, overlayType, proof)
  const { t } = useTranslation()
  if (!hasBody) return
  return (
    <>
      {isBranding10 ? (
        <View style={{ flexDirection: 'row' }}>
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
              styles.textContainer,
              {
                lineHeight: 19,
                opacity: 0.8,
                flex: 1,
                flexWrap: 'wrap',
              },
            ]}
          >
            {overlay.metaOverlay?.issuer}
          </Text>
        </View>
      ) : (
        <View style={styles.credentialIssuerContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
            }}
          >
            <Text
              testID={testIdWithKey('CredentialIssuer')}
              style={[
                TextTheme.normal,
                styles.textContainer,
                {
                  fontWeight: '500',
                  fontSize: 12,
                  lineHeight: 19,
                  opacity: 0.8,
                  textAlign: 'right',
                },
              ]}
            >
              {overlay.metaOverlay?.issuer !== 'Unknown Contact'
                ? overlay.metaOverlay?.issuer
                : t('Contacts.UnknownContact')}
            </Text>
          </View>
        </View>
      )}
    </>
  )
}

export default CredentialIssuerBody
