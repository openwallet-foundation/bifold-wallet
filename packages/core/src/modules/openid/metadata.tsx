import type { W3cCredentialRecord, SdJwtVcRecord, MdocRecord } from '@credo-ts/core'
import type { OpenId4VciCredentialSupported, OpenId4VciIssuerMetadataDisplay } from '@credo-ts/openid4vc'
import type { MetadataDisplay } from '@sphereon/oid4vci-common'
import { CredentialSubjectRecord } from './types'

export interface OpenId4VcCredentialMetadata {
  credential: {
    display?: OpenId4VciCredentialSupported['display']
    order?: OpenId4VciCredentialSupported['order']
    credential_subject?: CredentialSubjectRecord
  }
  issuer: {
    display?: OpenId4VciIssuerMetadataDisplay[]
    id: string
  }
}

export type OpenId4VcCredentialMetadataExtended = Partial<
  OpenId4VciCredentialSupported & { credential_subject: CredentialSubjectRecord }
>
const openId4VcCredentialMetadataKey = '_bifold/openId4VcCredentialMetadata'

export function extractOpenId4VcCredentialMetadata(
  credentialMetadata: Partial<OpenId4VciCredentialSupported & { credential_subject: CredentialSubjectRecord }>,
  serverMetadata: { display?: MetadataDisplay[]; id: string }
): OpenId4VcCredentialMetadata {
  return {
    credential: {
      display: credentialMetadata.display,
      order: credentialMetadata.order,
      credential_subject: credentialMetadata.credential_subject,
    },
    issuer: {
      display: serverMetadata.display,
      id: serverMetadata.id,
    },
  }
}

/**
 * Gets the OpenId4Vc credential metadata from the given W3C credential record.
 */
export function getOpenId4VcCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
): OpenId4VcCredentialMetadata | null {
  return credentialRecord.metadata.get(openId4VcCredentialMetadataKey)
}

/**
 * Sets the OpenId4Vc credential metadata on the given W3cCredentialRecord or SdJwtVcRecord.
 *
 * NOTE: this does not save the record.
 */
export function setOpenId4VcCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
  metadata: OpenId4VcCredentialMetadata
) {
  credentialRecord.metadata.set(openId4VcCredentialMetadataKey, metadata)
}
