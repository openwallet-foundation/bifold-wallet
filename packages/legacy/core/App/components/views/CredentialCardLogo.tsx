import { Image, StyleSheet, Text, View } from 'react-native'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
import { useEffect, useState } from 'react'

type Props = {
  overlay: CredentialOverlay<BrandingOverlay>
  brandingOverlayType?: BrandingOverlayType
}

const CredentialCardLogo: React.FC<Props> = ({
  overlay,
  brandingOverlayType = BrandingOverlayType.Branding10,
}: Props) => {
  const { TextTheme, CredentialCardShadowTheme } = useTheme()
  const [logoText, setLogoText] = useState(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')
  const logoHeight = brandingOverlayType === BrandingOverlayType.Branding10 ? 80 : 48
  const paddingHorizontal = 24

  useEffect(() => {
    if (brandingOverlayType === BrandingOverlayType.Branding11) {
      setLogoText(overlay.metaOverlay?.issuer ?? 'I')
    }
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
        <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
          {logoText.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

export default CredentialCardLogo
