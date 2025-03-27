import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native'
import { toImageSource } from '../../utils/credential'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

interface CredentialCardLogo {
  noLogoText: string
  overlay: CredentialOverlay<BrandingOverlay>
  overlayType: BrandingOverlayType
  elevated?: boolean
}

const CredentialCard11Logo: React.FC<CredentialCardLogo> = ({
  noLogoText,
  overlay,
  overlayType,
  elevated,
}: CredentialCardLogo) => {
  const { CredentialCardShadowTheme } = useTheme()
  const { width } = useWindowDimensions()
  const padding = width * 0.05
  const logoHeight = width * 0.12

  const styles = StyleSheet.create({
    logoContainer: {
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...(overlayType === BrandingOverlayType.Branding10 && {
        top: padding,
        left: -1 * logoHeight + padding,
        ...CredentialCardShadowTheme,
      }),
    },
  })
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
          style={{
            fontSize: 0.5 * logoHeight,
            alignSelf: 'center',
            color: '#000',
          }}
          testID={testIdWithKey('NoLogoText')}
        >
          {noLogoText.charAt(0).toUpperCase()}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCard11Logo
