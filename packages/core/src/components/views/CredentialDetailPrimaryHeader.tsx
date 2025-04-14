import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import CardWatermark from '../../components/misc/CardWatermark'
import { useTheme } from '../../contexts/theme'
import { credentialTextColor } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'
import { CredentialExchangeRecord } from '@credo-ts/core'
import { useTranslation } from 'react-i18next'
import { formatTime } from '../../utils/helpers'
import { ThemedText } from '../texts/ThemedText'

type CredentialDetailPrimaryHeaderProps = {
  overlay: CredentialOverlay<BrandingOverlay>
  brandingOverlayType?: BrandingOverlayType
  credential?: CredentialExchangeRecord
}

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetailPrimaryHeader: React.FC<CredentialDetailPrimaryHeaderProps> = ({
  overlay,
  brandingOverlayType = BrandingOverlayType.Branding10,
  credential,
}: CredentialDetailPrimaryHeaderProps) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const { width, height } = useWindowDimensions()
  const isBranding11 = brandingOverlayType === BrandingOverlayType.Branding11
  const styles = StyleSheet.create({
    primaryHeaderContainer: {
      paddingHorizontal: isBranding11 ? 16 : paddingHorizontal,
      paddingVertical,
      overflow: 'hidden',
    },
    textContainer: {
      color:
        brandingOverlayType === BrandingOverlayType.Branding10
          ? credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor)
          : ColorPallet.brand.primary,
    },
  })

  return (
    <View
      testID={testIdWithKey('CredentialDetailsPrimaryHeader')}
      style={[styles.primaryHeaderContainer, { zIndex: -1 }]}
    >
      <View>
        {overlay.metaOverlay?.watermark && brandingOverlayType === BrandingOverlayType.Branding10 && (
          <CardWatermark width={width} height={height} watermark={overlay.metaOverlay?.watermark} />
        )}
        {brandingOverlayType === BrandingOverlayType.Branding10 && (
          <ThemedText
            accessibilityLabel={`${t('Credentials.IssuedBy')} ${overlay.metaOverlay?.issuer}`}
            testID={testIdWithKey('CredentialIssuer')}
            variant="label"
            style={[
              styles.textContainer,
              {
                paddingLeft: logoHeight + paddingVertical,
                paddingBottom: paddingVertical,
                lineHeight: 19,
                opacity: 0.8,
              },
            ]}
            numberOfLines={1}
          >
            {overlay.metaOverlay?.issuer}
          </ThemedText>
        )}
        <ThemedText
          accessibilityLabel={`${overlay.metaOverlay?.name} ${t('Credentials.Credential')}`}
          testID={testIdWithKey('CredentialName')}
          style={[
            styles.textContainer,
            {
              lineHeight: 24,
            },
          ]}
        >
          {overlay.metaOverlay?.name}
        </ThemedText>
        {brandingOverlayType === BrandingOverlayType.Branding11 && credential && (
          <ThemedText
            testID={testIdWithKey('IssuedOn')}
            style={[
              styles.textContainer,
              {
                lineHeight: 24,
                marginTop: 8,
                fontSize: 14,
                color: ColorPallet.grayscale.mediumGrey,
              },
            ]}
          >
            {t('CredentialDetails.IssuedOn')} {formatTime(credential.createdAt, { includeHour: true })}
          </ThemedText>
        )}
      </View>
    </View>
  )
}

export default CredentialDetailPrimaryHeader
