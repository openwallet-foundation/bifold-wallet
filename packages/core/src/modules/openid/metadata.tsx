import {
  W3cCredentialRecord,
  SdJwtVcRecord,
  MdocRecord,
  W3cV2CredentialRecord,
  AgentContext,
  W3cCredentialRepository,
  SdJwtVcRepository,
  MdocRepository,
} from '@credo-ts/core'
import type {
  OpenId4VciCredentialIssuerMetadataDisplay,
  OpenId4VciRequestTokenResponse,
} from '@credo-ts/openid4vc'
import { RefreshCredentialMetadata, RefreshStatus } from './refresh/types'
import { CredentialDisplay, CredentialSubjectRecord } from './types'

export const openId4VcCredentialMetadataKey = '_bifold/openId4VcCredentialMetadata'
export const refreshCredentialMetadataKey = '_bifold/refreshCredentialMetadata'
export interface OpenId4VcCredentialMetadata {
  credential: {
    display?: CredentialDisplay[]
    order?: unknown
    credential_subject?: CredentialSubjectRecord
  }
  issuer: {
    display?: OpenId4VciCredentialIssuerMetadataDisplay[]
    id: string
  }
}

type CredentialSupported = {
  display: CredentialDisplay[],
  order?: unknown,
}

export type OpenId4VcCredentialMetadataExtended = Partial<
  CredentialSupported & { credential_subject: CredentialSubjectRecord }
>

export type OpenIDCredentialNotificationMetadata = {
  notificationMetadata?: any //OpenId4VciNotificationMetadata
  tokenResponse?: OpenId4VciRequestTokenResponse
}

export function extractOpenId4VcCredentialMetadata(
  credentialMetadata: Partial<CredentialSupported & { credential_subject: CredentialSubjectRecord }>,
  serverMetadata: { display?: OpenId4VciCredentialIssuerMetadataDisplay[]; id: string }
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
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord
): OpenId4VcCredentialMetadata | null {
  return credentialRecord.metadata.get(openId4VcCredentialMetadataKey)
}

/**
 * Sets the OpenId4Vc credential metadata on the given W3cCredentialRecord or SdJwtVcRecord.
 *
 * NOTE: this does not save the record.
 */
export function setOpenId4VcCredentialMetadata(
  credentialRecord: SdJwtVcRecord | MdocRecord | W3cCredentialRecord | W3cV2CredentialRecord,
  metadata: OpenId4VcCredentialMetadata
) {
  credentialRecord.metadata.set(openId4VcCredentialMetadataKey, metadata)
}

/**
 * Gets the refresh credential metadata from the given credential record.
 */
export function getRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord
): RefreshCredentialMetadata | null {
  return credentialRecord.metadata.get(refreshCredentialMetadataKey)
}

/**
 * Sets the refresh credential metadata on the given credential record
 *
 * NOTE: this does not save the record.
 */
export function setRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord,
  metadata: RefreshCredentialMetadata
) {
  credentialRecord.metadata.set(refreshCredentialMetadataKey, metadata)
}

export function deleteRefreshCredentialMetadata(credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord) {
  credentialRecord.metadata.delete(refreshCredentialMetadataKey)
}

export async function persistCredentialRecord(
  agentContext: AgentContext,
  record: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord
) {
  if (record instanceof W3cCredentialRecord) {
    await agentContext.dependencyManager.resolve(W3cCredentialRepository).update(agentContext, record)
  } else if (record instanceof SdJwtVcRecord) {
    await agentContext.dependencyManager.resolve(SdJwtVcRepository).update(agentContext, record)
  } else if (record instanceof MdocRecord) {
    await agentContext.dependencyManager.resolve(MdocRepository).update(agentContext, record)
  } else {
    throw new Error('Unsupported credential record type for persistence')
  }
}

export async function markOpenIDCredentialStatus({
  credential,
  status,
  agentContext,
}: {
  credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord
  status: RefreshStatus
  agentContext: AgentContext
}) {
  const refreshMetadata = getRefreshCredentialMetadata(credential)
  if (!refreshMetadata) {
    throw new Error('No refresh metadata found on the credential record.')
  }

  refreshMetadata.lastCheckResult = status

  setRefreshCredentialMetadata(credential, refreshMetadata)

  // Persist the updated credential record
  await persistCredentialRecord(agentContext, credential)
}

export const temporaryMetaVanillaObject: OpenIDCredentialNotificationMetadata = {
  notificationMetadata: undefined,
  tokenResponse: undefined,
}
