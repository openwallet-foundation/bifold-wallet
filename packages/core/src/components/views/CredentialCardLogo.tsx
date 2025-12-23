import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import React, { useMemo } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { useTheme } from '../../contexts/theme'
import LogoOrLetter from '../../components/misc/LogoOrLetter'

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
    <LogoOrLetter
      containerStyle={styles.logoContainer}
      logo={overlay.brandingOverlay?.logo}
      logoHeight={logoHeight}
      letter={logoText}
      letterVariant="title"
      letterColor={isBranding11 ? textColor ?? '#000' : '#000'}
      showTestIds={false} // this one didn’t have testIDs before
    />
  )
}

export default CredentialCardLogo
