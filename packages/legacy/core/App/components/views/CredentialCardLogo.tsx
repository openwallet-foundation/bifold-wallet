import { Image, StyleSheet, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
import { useMemo } from 'react'
import { ThemedText } from '../texts/ThemedText'

type Props = {
  overlay: CredentialOverlay<BrandingOverlay>
  brandingOverlayType?: BrandingOverlayType
}

const CredentialCardLogo: React.FC<Props> = ({
  overlay,
  brandingOverlayType = BrandingOverlayType.Branding10,
}: Props) => {
  const { CredentialCardShadowTheme } = useTheme()
  const logoHeight = brandingOverlayType === BrandingOverlayType.Branding10 ? 80 : 48
  const paddingHorizontal = 24

  const logoText = useMemo(() => {
    if (brandingOverlayType === BrandingOverlayType.Branding11) {
      return (overlay.metaOverlay?.issuer ?? 'I').charAt(0).toUpperCase()
    }
    return (overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C').charAt(0).toUpperCase()
  }, [brandingOverlayType, overlay])

  const styles = StyleSheet.create({
    logoContainer: {
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...(brandingOverlayType === BrandingOverlayType.Branding10 && {
        top: -0.5 * logoHeight,
        left: paddingHorizontal,
        marginBottom: -1 * logoHeight,
        ...CredentialCardShadowTheme,
      }),
    },
  })

  return (
    <View style={styles.logoContainer}>
      {overlay.brandingOverlay?.logo ? (
        <Image
          source={toImageSource(overlay.brandingOverlay?.logo)}
          style={{
            resizeMode: 'cover',
            width: logoHeight,
            height: logoHeight,
            borderRadius: 8,
          }}
        />
      ) : (
        <ThemedText variant="title" style={{ fontSize: 0.5 * logoHeight, color: '#000' }} accessible={false}>
          {logoText}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCardLogo
