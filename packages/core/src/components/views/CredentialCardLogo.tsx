import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import React, { useMemo } from 'react'
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
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
  const { fontScale } = useWindowDimensions()
  const logoHeight = brandingOverlayType === BrandingOverlayType.Branding10 ? 80 : 48
  const paddingHorizontal = 24
  const isBranding11 = brandingOverlayType === BrandingOverlayType.Branding11
  const textColor =
    overlay.brandingOverlay?.secondaryBackgroundColor && overlay.brandingOverlay.secondaryBackgroundColor !== ''
      ? overlay.brandingOverlay.secondaryBackgroundColor
      : overlay.brandingOverlay?.primaryBackgroundColor

  const logoText = useMemo(() => {
    if (brandingOverlayType === BrandingOverlayType.Branding11) {
      return (overlay.metaOverlay?.issuer ?? 'I').charAt(0).toUpperCase()
    }
    return (overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C').charAt(0).toUpperCase()
  }, [brandingOverlayType, overlay])

  const styles = StyleSheet.create({
    logoContainer: {
      width: logoHeight * (fontScale > 1.7 ? 1.2 : 1),
      height: logoHeight * (fontScale > 1.7 ? 1.2 : 1),
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
        <ThemedText
          variant="title"
          style={{ fontSize: 0.5 * logoHeight, color: isBranding11 ? textColor : '#000' }}
          accessible={false}
        >
          {logoText}
        </ThemedText>
      )}
    </View>
  )
}

export default CredentialCardLogo
