import type { W3cCredentialRecord, SdJwtVcRecord } from '@credo-ts/core'
import type { OpenId4VciCredentialSupported, OpenId4VciIssuerMetadataDisplay } from '@credo-ts/openid4vc'
import type { EndpointMetadataResult } from '@sphereon/oid4vci-common'

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

const openId4VcCredentialMetadataKey = '_bifold/openId4VcCredentialMetadata'

export function extractOpenId4VcCredentialMetadata(
  credentialMetadata: OpenId4VciCredentialSupported,
  serverMetadata: EndpointMetadataResult
): OpenId4VcCredentialMetadata {
  return {
    credential: {
      display: credentialMetadata.display,
      order: credentialMetadata.order,
    },
    issuer: {
      display: serverMetadata.credentialIssuerMetadata?.display,
      id: serverMetadata.issuer,
    },
  }
}

/**
 * Gets the OpenId4Vc credential metadata from the given W3C credential record.
 */
export function getOpenId4VcCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord
): OpenId4VcCredentialMetadata | null {
  return credentialRecord.metadata.get(openId4VcCredentialMetadataKey)
}

/**
 * Sets the OpenId4Vc credential metadata on the given W3cCredentialRecord or SdJwtVcRecord.
 *
 * NOTE: this does not save the record.
 */
export function setOpenId4VcCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord,
  metadata: OpenId4VcCredentialMetadata
) {
  credentialRecord.metadata.set(openId4VcCredentialMetadataKey, metadata)
}
