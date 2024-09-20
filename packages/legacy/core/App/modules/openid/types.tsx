import { OpenId4VciCredentialSupported, OpenId4VciIssuerMetadataDisplay } from "@credo-ts/openid4vc"

export type CredentialForDisplayId = `w3c-credential-${string}` | `sd-jwt-vc-${string}`
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
    locale?: string
    description?: string
    textColor?: string
    backgroundColor?: string
    backgroundImage?: DisplayImage
    issuer: CredentialIssuerDisplay
}
  
export interface CredentialIssuerDisplay {
    name: string
    locale?: string
    logo?: DisplayImage
}

export type W3cCredentialDisplay = {
    id: string
    createdAt: Date
    display: CredentialDisplay
    credential?: W3cCredentialJson
    attributes: W3cCredentialSubjectJson
}

  