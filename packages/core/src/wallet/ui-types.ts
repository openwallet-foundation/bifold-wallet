import { Attribute, Predicate } from '@bifold/oca/build/legacy/resolver/record'

export type BrandingType = 'Branding01' | 'Branding10' | 'Branding11'

export type AttrFormat = 'text' | 'date' | 'datetime' | 'image'

export interface CardAttribute {
  key: string
  label: string
  value: string | number | null
  format?: AttrFormat
  isPII?: boolean
  hasError?: boolean
  predicate?: { present: boolean; satisfied?: boolean; text?: string }
}

export interface BrandingBits {
  type: BrandingType
  primaryBg: string
  secondaryBg?: string
  logo1x1Uri?: string
  logoText?: string
  backgroundSliceUri?: string
  backgroundFullUri?: string
  watermark?: string
  preferredTextColor?: string
}

export type CardStatus = 'error' | 'warning' | undefined

/** Minimal shape extracted from OCA bundle resolver output */
export interface AnonCredsBundleLite {
  labels?: Record<string, string>
  formats?: Record<string, AttrFormat>
  flaggedPII?: string[]
  primaryAttributeKey?: string
  secondaryAttributeKey?: string
  issuer?: string
  name?: string
  watermark?: string
  helpActionUrl?: string
  branding: BrandingBits
}

/** W3C VC → UI model */
export interface W3CInput {
  vc: {
    issuer?: { id?: string; name?: string } | string
    type?: string[]
    credentialSubject?: Record<string, unknown>
    name?: string
  }
  branding: BrandingBits
  labels?: Record<string, string>
  formats?: Record<string, AttrFormat>
  piiKeys?: string[]
  helpActionUrl?: string
}

export interface WalletCredentialCardData {
  id: string
  issuerName: string
  credentialName: string
  connectionLabel?: string

  branding: BrandingBits
  items: CardAttribute[]
  primaryAttributeKey?: string
  secondaryAttributeKey?: string

  brandingType: BrandingType
  proofContext?: boolean
  revoked?: boolean
  notInWallet?: boolean
  allPI?: boolean
  helpActionUrl?: string

  status?: CardStatus
}

export type MapOpts = {
  proofContext?: boolean
  revoked?: boolean
  notInWallet?: boolean
  connectionLabel?: string
  /** Proof-only: attributes/predicates to display instead of the full credential */
  displayItems?: (Attribute | Predicate)[]
}

export const isPredicate = (x: any): x is Predicate => x && (typeof x.pType === 'string' || x.pValue !== undefined)
