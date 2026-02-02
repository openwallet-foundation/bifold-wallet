import React from 'react'
import { ViewStyle } from 'react-native'
import { useTheme } from '../../contexts/theme'
import LogoOrLetter from './LogoOrLetter'

interface CredentialCardLogo {
  noLogoText: string
  containerStyle: ViewStyle
  logoHeight: number
  primaryBackgroundColor: string
  secondaryBackgroundColor?: string
  elevated?: boolean
  logo?: string
  isBranding11?: boolean
}

const CredentialCardGenLogo: React.FC<CredentialCardLogo> = ({
  noLogoText,
  containerStyle,
  logoHeight,
  secondaryBackgroundColor,
  primaryBackgroundColor,
  elevated,
  logo,
  isBranding11,
}: CredentialCardLogo) => {
  const { TextTheme } = useTheme()
  const textColor =
    secondaryBackgroundColor && secondaryBackgroundColor !== '' ? secondaryBackgroundColor : primaryBackgroundColor

  return (
    <LogoOrLetter
      containerStyle={containerStyle}
      elevated={elevated}
      logo={logo}
      logoHeight={logoHeight}
      letter={noLogoText}
      letterVariant="bold"
      letterStyle={TextTheme.bold}
      letterColor={isBranding11 ? textColor : '#000'}
    />
  )
}

export default CredentialCardGenLogo
