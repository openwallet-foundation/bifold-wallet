import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { View } from 'react-native'
import { testIdWithKey } from '../../utils/testable'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import CredentialCard11Logo from './CredentialCard11Logo'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { ThemedText } from '../texts/ThemedText'

interface Props {
  overlay: CredentialOverlay<BrandingOverlay>
  overlayType: BrandingOverlayType
  hasBody: boolean
  elevated?: boolean
  proof?: boolean
}

const CredentialIssuerBody: React.FC<Props> = ({ overlay, overlayType, elevated, hasBody, proof }: Props) => {
  const isBranding10 = overlayType === BrandingOverlayType.Branding10
  const { styles } = useCredentialCardStyles(overlay, overlayType, proof)
  const { t } = useTranslation()
  if (!hasBody) return
  return (
    <>
      {isBranding10 ? (
        <View style={{ flexDirection: 'row' }}>
          <ThemedText
            variant="label"
            testID={testIdWithKey('CredentialIssuer')}
            style={[
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
          </ThemedText>
        </View>
      ) : (
        <View style={styles.credentialIssuerContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CredentialCard11Logo
              noLogoText={
                overlay.metaOverlay?.issuer && overlay.metaOverlay?.issuer !== 'Unknown Contact'
                  ? overlay.metaOverlay?.issuer
                  : t('Contacts.UnknownContact')
              }
              overlay={overlay}
              overlayType={overlayType}
              elevated={elevated}
            />
            <ThemedText
              testID={testIdWithKey('CredentialIssuer')}
              style={[
                styles.textContainer,
                {
                  fontWeight: '500',
                  fontSize: 12,
                  lineHeight: 19,
                  opacity: 0.8,
                  flexWrap: 'wrap',
                },
              ]}
            >
              {overlay.metaOverlay?.issuer !== 'Unknown Contact'
                ? overlay.metaOverlay?.issuer
                : t('Contacts.UnknownContact')}
            </ThemedText>
          </View>
        </View>
      )}
    </>
  )
}

export default CredentialIssuerBody
