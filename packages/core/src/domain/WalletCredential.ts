// wallet/ui-types.ts
export type AttrFormat = 'date' | 'datetime' | 'image' | 'text'

export interface CardAttribute {
  key: string // internal name
  label: string // user-facing label
  value: string | number | null
  format?: AttrFormat
  isPII?: boolean // used for "allPI" warning logic
  hasError?: boolean // missing in wallet, etc.
  predicate?: {
    present: boolean // this attribute is a predicate
    satisfied?: boolean // if predicate, was it satisfied?
    text?: string // ">= 18", etc.
  }
}

export interface BrandingBits {
  // Everything the card needs to look good w/o overlay
  primaryBg?: string
  secondaryBg?: string
  // Optional images
  logo1x1Uri?: string // MUST be square (1x1)
  backgroundSliceUri?: string // left slice image
  backgroundFullUri?: string // full background image when hideSlice=true
  watermark?: string
}

export type CardStatus = 'error' | 'warning' | undefined

export interface WalletCredentialCardData {
  // identity
  id: string
  issuerName: string // "Ontario Ministry of …" (fallbacks allowed)
  credentialName: string // "Driver’s Licence" (title on the card)
  connectionLabel?: string // for accessibility text
  // look & feel
  branding: BrandingBits
  // content rows for the list in the body
  items: CardAttribute[]
  // primary + secondary “featured” attributes (optional)
  primaryAttributeKey?: string // key of an item to elevate
  secondaryAttributeKey?: string // key of an item to elevate
  // runtime state for badges / status
  proofContext?: boolean // true if shown inside a proof flow
  revoked?: boolean
  notInWallet?: boolean // for proof: requested cred not found
  allPI?: boolean // if all shown are PII -> warning badge
  helpActionUrl?: string // "Get this credential" action
  // optional color override for text contrast (precomputed)
  preferredTextColor?: string
  // convenience: what icon to show (computed once)
  status?: CardStatus
}
