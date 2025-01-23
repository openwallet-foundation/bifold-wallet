import { BrandingOverlay } from '@hyperledger/aries-oca'
import { BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { useTheme } from '../contexts/theme'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { getSecondaryBackgroundColor } from '../utils/helpers'
import { credentialTextColor } from '../utils/credential'

const useCredentialCardStyles = (
  overlay: CredentialOverlay<BrandingOverlay>,
  brandingOverlayType: BrandingOverlayType,
  proof?: boolean
) => {
  const { ColorPallet, TextTheme, ListItems, CredentialCardShadowTheme } = useTheme()
  const { width } = useWindowDimensions()
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const borderRadius = 10

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      borderRadius: borderRadius,
      ...(brandingOverlayType === BrandingOverlayType.Branding11 && {
        ...CredentialCardShadowTheme,
      }),
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
      ...(brandingOverlayType === BrandingOverlayType.Branding10 && {
        marginLeft: -1 * logoHeight + padding,
      }),
    },
    primaryBodyNameContainer: {
      flexDirection: 'row',
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
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...(brandingOverlayType === BrandingOverlayType.Branding10 && {
        top: padding,
        left: -1 * logoHeight + padding,
        ...CredentialCardShadowTheme,
      }),
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
      color: proof
        ? TextTheme.normal.color
        : credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
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
      maxWidth: '80%',
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
      borderColor: ColorPallet.semantic.focus,
    },
    credActionText: {
      fontSize: 20,
      fontWeight: TextTheme.bold.fontWeight,
      color: ColorPallet.brand.link,
    },
    cardAttributeContainer: {
      marginVertical: 16,
      gap: 4,
    },
  })

  return { styles, borderRadius, logoHeight }
}

export default useCredentialCardStyles
