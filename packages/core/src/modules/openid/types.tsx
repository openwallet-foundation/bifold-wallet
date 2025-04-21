import {
  OpenId4VciCredentialSupported,
  OpenId4VciIssuerMetadataDisplay,
  OpenId4VcSiopResolvedAuthorizationRequest,
} from '@credo-ts/openid4vc'
import { CredentialMetadata } from './display'
import { ClaimFormat, DifPexCredentialsForRequest, DifPresentationExchangeDefinition } from '@credo-ts/core'

export type CredentialForDisplayId = `w3c-credential-${string}` | `sd-jwt-vc-${string}` | `mdoc-${string}`
export interface OpenId4VcCredentialMetadata {
  credential: {
    display?: OpenId4VciCredentialSupported['display']
    order?: OpenId4VciCredentialSupported['order']
  }
  issuer: {
    display?: OpenId4VciIssuerMetadataDisplay[]
    id: string
  }
}

export type W3cIssuerJson = {
  id: string
}

export type W3cCredentialSubjectJson = {
  id?: string
  [key: string]: unknown
}

export type W3cCredentialJson = {
  type: Array<string>
  issuer: W3cIssuerJson
  issuanceDate: string
  expiryDate?: string
  credentialSubject: W3cCredentialSubjectJson | W3cCredentialSubjectJson[]
}

export type JffW3cCredentialJson = W3cCredentialJson & {
  name?: string
  description?: string
  credentialBranding?: {
    backgroundColor?: string
  }

  issuer:
    | string
    | (W3cIssuerJson & {
        name?: string
        iconUrl?: string
        logoUrl?: string
        image?: string | { id?: string; type?: 'Image' }
      })
}

export interface DisplayImage {
  url?: string
  altText?: string
}

export interface CredentialDisplay {
  name: string
  issuer: CredentialIssuerDisplay
  locale?: string
  description?: string
  textColor?: string
  backgroundColor?: string
  backgroundImage?: DisplayImage
  logo?: DisplayImage
  primary_overlay_attribute?: string
}

export interface CredentialIssuerDisplay {
  name: string
  locale?: string
  logo?: DisplayImage
  domain?: string
}

export interface W3cCredentialDisplay {
  id: string
  createdAt: Date
  display: CredentialDisplay
  credential?: W3cCredentialJson
  attributes: W3cCredentialSubjectJson
  metadata: CredentialMetadata
  claimFormat: ClaimFormat
  validUntil: Date | undefined
  validFrom: Date | undefined
  credentialSubject: CredentialSubjectRecord | undefined
}

export interface OpenId4VPRequestRecord extends OpenId4VcSiopResolvedAuthorizationRequest {
  definition: DifPresentationExchangeDefinition
  verifierHostName: string | undefined
  createdAt: string | Date
  credentialsForRequest: DifPexCredentialsForRequest | undefined
  type: string
}

interface DisplayInfo {
  name: string
  locale?: string
}

export type CredentialSubjectRecord = Record<string, { display: DisplayInfo[] }>

export enum OpenIDCredentialType {
  W3cCredential,
  SdJwtVc,
  Mdoc,
}
