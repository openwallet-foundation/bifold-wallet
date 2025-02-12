import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import CardWatermark from '../../components/misc/CardWatermark'
import { useTheme } from '../../contexts/theme'
import { credentialTextColor } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'
import { CredentialExchangeRecord } from '@credo-ts/core'
import { useTranslation } from 'react-i18next'
import { formatTime } from '../../utils/helpers'

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
  const { TextTheme, ColorPallet } = useTheme()
  const { width, height } = useWindowDimensions()
  const styles = StyleSheet.create({
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
      overflow: 'hidden',
    },
    textContainer: {
      color:
        brandingOverlayType === BrandingOverlayType.Branding10
          ? credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor)
          : ColorPallet.grayscale.white,
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
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
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
          </Text>
        )}
        <Text
          testID={testIdWithKey('CredentialName')}
          style={[
            TextTheme.normal,
            styles.textContainer,
            {
              lineHeight: 24,
            },
          ]}
        >
          {overlay.metaOverlay?.name}
        </Text>
        {brandingOverlayType === BrandingOverlayType.Branding11 && credential && (
          <Text
            testID={testIdWithKey('IssuedOn')}
            style={[
              TextTheme.normal,
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
          </Text>
        )}
      </View>
    </View>
  )
}

export default CredentialDetailPrimaryHeader
