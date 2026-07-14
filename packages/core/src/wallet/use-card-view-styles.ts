import { StyleSheet, useWindowDimensions } from 'react-native'
import { useTheme } from '../contexts/theme'
import { credentialTextColor } from '../utils/credential'
import type { WalletCredentialCardBranding, WalletCredentialCardLayout } from './card-view-model'

const useCardViewStyles = (branding: WalletCredentialCardBranding, layout: WalletCredentialCardLayout) => {
  const { ColorPalette, TextTheme, ListItems, CredentialCardShadowTheme } = useTheme()
  const { width, fontScale } = useWindowDimensions()
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const borderRadius = 10
  const isCard11 = layout === 'card11'
  const primaryBackgroundColor = branding.primaryBackgroundColor
  const secondaryBackgroundColor = branding.secondaryBackgroundColor ?? primaryBackgroundColor

  const styles = StyleSheet.create({
    container: {
      backgroundColor: primaryBackgroundColor,
      borderRadius,
      ...CredentialCardShadowTheme,
    },
    cardContainer: { flexDirection: 'row', minHeight: 0.33 * width },
    secondaryBodyContainer: {
      width: logoHeight,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      backgroundColor: secondaryBackgroundColor,
    },
    primaryBodyContainer: {
      flex: 1,
      padding,
      ...(isCard11 && { justifyContent: 'space-between' }),
      marginLeft: layout === 'card10' ? -1 * logoHeight + padding : -1.3 * logoHeight + padding,
    },
    primaryBodyNameContainer: {
      flexDirection: 'row',
      ...(isCard11 && { minHeight: logoHeight, alignItems: 'center' }),
    },
    recordAttributeText: { fontSize: ListItems.recordAttributeText.fontSize },
    imageAttr: { height: 150, aspectRatio: 1, resizeMode: 'contain', borderRadius },
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
    headerText: { ...TextTheme.labelSubtitle, ...ListItems.recordAttributeText, fontSize: 15, flexShrink: 1 },
    valueText: { ...TextTheme.normal, minHeight: ListItems.recordAttributeText.fontSize, paddingVertical: 4 },
    textContainer: {
      color: credentialTextColor(ColorPalette, primaryBackgroundColor),
      flexShrink: 1,
      ...(isCard11 && { fontSize: 16 }),
      lineHeight: 24,
    },
    credentialName: {
      flex: 1,
      flexWrap: 'wrap',
      ...(isCard11 && { lineHeight: 16, maxWidth: '85%', fontSize: 14, fontWeight: '600' }),
    },
    credentialIssuerContainer: {
      flex: 1,
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
      maxWidth: 225,
      paddingTop: 5,
    },
    errorText: { ...TextTheme.normal, color: ListItems.proofError.color },
    errorIcon: { color: ListItems.proofError.color },
    selectedCred: { borderWidth: 5, borderRadius: 15, borderColor: ColorPalette.semantic.focus },
    credActionText: { fontSize: 20, fontWeight: TextTheme.bold.fontWeight, color: ColorPalette.brand.link },
    cardAttributeContainer: { marginVertical: 16, gap: 4 },
  })

  return { styles, borderRadius, logoHeight }
}

export default useCardViewStyles
