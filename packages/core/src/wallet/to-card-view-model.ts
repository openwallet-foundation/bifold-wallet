import type { WalletCredentialCardData } from './ui-types'
import type { WalletCredentialCardViewModel } from './card-view-model'

/**
 * Transitional adapter from the existing mapper output to the OCA-free card
 * view contract. Protocol and OCA-specific decisions remain upstream of this
 * boundary.
 */
export const toWalletCredentialCardViewModel = (data: WalletCredentialCardData): WalletCredentialCardViewModel => ({
  id: data.id,
  layout: data.brandingType === 'Branding01' ? 'card10' : 'card11',
  issuerName: data.issuerName,
  credentialName: data.credentialName,
  connectionLabel: data.connectionLabel,
  branding: {
    primaryBackgroundColor: data.branding.primaryBg,
    secondaryBackgroundColor: data.branding.secondaryBg,
    logoUri: data.branding.logo1x1Uri,
    logoText: data.branding.logoText,
    backgroundSliceUri: data.branding.backgroundSliceUri,
    backgroundImageUri: data.branding.backgroundFullUri,
    watermark: data.branding.watermark,
    preferredTextColor: data.branding.preferredTextColor,
  },
  attributes: data.items,
  primaryAttributeKey: data.primaryAttributeKey,
  secondaryAttributeKey: data.secondaryAttributeKey,
  extraAttribute: data.extraOverlayParameter,
  proofContext: data.proofContext,
  revoked: data.revoked,
  notInWallet: data.notInWallet,
  allPI: data.allPI,
  helpActionUrl: data.helpActionUrl,
  status: data.status,
  hideBrandingSlice: data.hideSlice,
})
