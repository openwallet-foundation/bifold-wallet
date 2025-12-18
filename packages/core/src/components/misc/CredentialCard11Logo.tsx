import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import React from 'react'
import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import LogoOrLetter from './LogoOrLetter'

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
    <LogoOrLetter
      containerStyle={styles.logoContainer}
      elevated={elevated}
      logo={overlay.brandingOverlay?.logo}
      logoHeight={logoHeight}
      letter={noLogoText}
      letterVariant="bold"
      letterStyle={TextTheme.bold}
      letterColor={isBranding11 ? textColor ?? '#000' : '#000'}
    />
  )
}

export default CredentialCard11Logo
