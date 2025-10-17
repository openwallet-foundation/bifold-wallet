import { JwaSignatureAlgorithm, JwkJson, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

export interface RefreshCredentialMetadata {
  authServer: string
  refreshToken: string
  dpop?: { alg: JwaSignatureAlgorithm; jwk: JwkJson }
}

const refreshCredentialMetadataKey = '_bifold/refreshCredentialMetadata'

/**
 * Gets the refresh credential metadata from the given credential record.
 */
export function getRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
): RefreshCredentialMetadata | null {
  return credentialRecord.metadata.get(refreshCredentialMetadataKey)
}

/**
 * Sets the refresh credential metadata on the given credential record
 *
 * NOTE: this does not save the record.
 */
export function setRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
  metadata: RefreshCredentialMetadata
) {
  credentialRecord.metadata.set(refreshCredentialMetadataKey, metadata)
}
