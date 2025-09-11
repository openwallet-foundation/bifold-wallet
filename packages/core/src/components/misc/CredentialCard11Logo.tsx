import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import React from 'react'
import { Image, View } from 'react-native'
import { ThemedText } from '../../components/texts/ThemedText'
import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import { toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

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
