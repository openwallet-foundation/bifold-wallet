/**
 * OCA-free contract for credential card views.
 *
 * Mappers select a local layout and translate protocol or OCA data into this
 * shape before it reaches a card component. Card views must not need to know
 * where this data came from.
 */
export type WalletCredentialCardLayout = 'card10' | 'card11'

export type CardAttributeFormat = 'text' | 'date' | 'datetime' | 'image'

export interface WalletCredentialCardAttribute {
  key: string
  label: string
  value: string | number | null
  format?: CardAttributeFormat
  isPII?: boolean
  hasError?: boolean
  predicate?: {
    present: boolean
    satisfied?: boolean
    text?: string
  }
}

export interface WalletCredentialCardBranding {
  primaryBackgroundColor: string
  secondaryBackgroundColor?: string
  logoUri?: string
  logoText?: string
  backgroundSliceUri?: string
  backgroundImageUri?: string
  watermark?: string
  preferredTextColor?: string
}

export type WalletCredentialCardStatus = 'error' | 'warning' | undefined

export interface WalletCredentialCardViewModel {
  id: string
  layout: WalletCredentialCardLayout
  issuerName: string
  credentialName: string
  connectionLabel?: string

  branding: WalletCredentialCardBranding
  attributes: WalletCredentialCardAttribute[]
  primaryAttributeKey?: string
  secondaryAttributeKey?: string
  extraAttribute?: WalletCredentialCardAttribute

  proofContext?: boolean
  revoked?: boolean
  notInWallet?: boolean
  allPI?: boolean
  helpActionUrl?: string
  status?: WalletCredentialCardStatus
  hideBrandingSlice?: boolean
}
