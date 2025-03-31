import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { Image, View } from 'react-native'
import { toImageSource } from '../../utils/credential'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import { TOKENS, useServices } from '../../container-api'
import { ThemedText } from '../../components/texts/ThemedText'

interface CredentialCardLogo {
  noLogoText: string
  overlay: CredentialOverlay<BrandingOverlay>
  elevated?: boolean
}

const CredentialCard11Logo: React.FC<CredentialCardLogo> = ({ noLogoText, overlay, elevated }: CredentialCardLogo) => {
  const { TextTheme } = useTheme()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])
  const isBranding11 = bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding11
  const textColor =
    overlay.brandingOverlay?.secondaryBackgroundColor && overlay.brandingOverlay.secondaryBackgroundColor !== ''
      ? overlay.brandingOverlay.secondaryBackgroundColor
      : overlay.brandingOverlay?.primaryBackgroundColor

  const { styles, logoHeight } = useCredentialCardStyles(overlay, bundleResolver.getBrandingOverlayType())

  return (
    <View style={[styles.logoContainer, { elevation: elevated ? 5 : 0 }]}>
      {overlay.brandingOverlay?.logo ? (
        <Image
          source={toImageSource(overlay.brandingOverlay?.logo)}
          style={{
            resizeMode: 'cover',
            width: logoHeight,
            height: logoHeight,
            borderRadius: 8,
          }}
          testID={testIdWithKey('Logo')}
        />
      ) : (
        <ThemedText
          variant="bold"
          style={[
            TextTheme.bold,
            {
              fontSize: 0.5 * logoHeight,
              alignSelf: 'center',
              color: isBranding11 ? textColor : '#000',
            },
          ]}
          testID={testIdWithKey('NoLogoText')}
        >
          {noLogoText.charAt(0).toUpperCase()}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCard11Logo
