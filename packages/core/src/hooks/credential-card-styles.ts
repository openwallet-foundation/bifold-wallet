import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import { useTheme } from '../contexts/theme'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { getSecondaryBackgroundColor } from '../utils/helpers'
import { credentialTextColor } from '../utils/credential'

const useCredentialCardStyles = (
  overlay: CredentialOverlay<BrandingOverlay>,
  brandingOverlayType: BrandingOverlayType,
  proof?: boolean
) => {
  const { ColorPalette, TextTheme, ListItems, CredentialCardShadowTheme } = useTheme()
  const { width, fontScale } = useWindowDimensions()
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const borderRadius = 10

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      borderRadius: borderRadius,
      ...CredentialCardShadowTheme,
    },
    cardContainer: {
      flexDirection: 'row',
      minHeight: 0.33 * width,
    },
    secondaryBodyContainer: {
      width: logoHeight,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      backgroundColor: getSecondaryBackgroundColor(overlay, proof) ?? overlay.brandingOverlay?.primaryBackgroundColor,
    },
    primaryBodyContainer: {
      flex: 1,
      padding,
      ...(brandingOverlayType === BrandingOverlayType.Branding11 && {
        justifyContent: 'space-between',
      }),
      marginLeft:
        brandingOverlayType === BrandingOverlayType.Branding10
          ? -1 * logoHeight + padding
          : -1.3 * logoHeight + padding,
    },
    primaryBodyNameContainer: {
      flexDirection: 'row',
      ...(brandingOverlayType === BrandingOverlayType.Branding11 && {
        minHeight: logoHeight,
        alignItems: 'center',
      }),
    },
    imageAttr: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: borderRadius,
    },
    statusContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderTopRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      height: logoHeight,
      width: logoHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      width: logoHeight * (fontScale > 1.7 ? 1.2 : 1),
      height: logoHeight * (fontScale > 1.7 ? 1.2 : 1),
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      top: padding,
      left: -1 * logoHeight + padding,
      ...CredentialCardShadowTheme,
    },
    headerText: {
      ...TextTheme.labelSubtitle,
      ...ListItems.recordAttributeText,
      fontSize: 15,
      flexShrink: 1,
    },
    valueText: {
      ...TextTheme.normal,
      minHeight: ListItems.recordAttributeText.fontSize,
      paddingVertical: 4,
    },
    textContainer: {
      color:
        proof && brandingOverlayType === BrandingOverlayType.Branding10
          ? TextTheme.normal.color
          : credentialTextColor(ColorPalette, overlay.brandingOverlay?.primaryBackgroundColor),
      flexShrink: 1,
      ...(brandingOverlayType === BrandingOverlayType.Branding11 && {
        fontSize: 16,
      }),
      lineHeight: 24,
    },
    credentialName: {
      flex: 1,
      flexWrap: 'wrap',
      ...(brandingOverlayType === BrandingOverlayType.Branding11 && {
        lineHeight: 16,
        maxWidth: '85%',
        fontSize: 14,
        fontWeight: '600',
      }),
    },
    credentialIssuerContainer: {
      flex: 1,
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      maxWidth: 225,
      paddingTop: 5,
    },
    errorText: {
      ...TextTheme.normal,
      color: ListItems.proofError.color,
    },
    errorIcon: {
      color: ListItems.proofError.color,
    },
    selectedCred: {
      borderWidth: 5,
      borderRadius: 15,
      borderColor: ColorPalette.semantic.focus,
    },
    credActionText: {
      fontSize: 20,
      fontWeight: TextTheme.bold.fontWeight,
      color: ColorPalette.brand.link,
    },
    cardAttributeContainer: {
      marginVertical: 16,
      gap: 4,
    },
  })

  return { styles, borderRadius, logoHeight }
}

export default useCredentialCardStyles
