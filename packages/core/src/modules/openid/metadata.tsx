import {
  W3cCredentialRecord,
  SdJwtVcRecord,
  MdocRecord,
  W3cV2CredentialRecord,
  AgentContext,
  W3cCredentialRepository,
  W3cV2CredentialRepository,
  SdJwtVcRepository,
  MdocRepository,
} from '@credo-ts/core'
import type {
  OpenId4VciCredentialIssuerMetadataDisplay,
  OpenId4VciMetadata,
  OpenId4VciRequestTokenResponse,
} from '@credo-ts/openid4vc'
import { RefreshCredentialMetadata, RefreshStatus } from './refresh/types'
import { CredentialDisplay, CredentialSubjectRecord } from './types'
import { OpenIDCredentialRecord } from './credentialRecord'

export const openId4VcCredentialMetadataKey = '_bifold/openId4VcCredentialMetadata'
export const refreshCredentialMetadataKey = '_bifold/refreshCredentialMetadata'
export interface OpenId4VcCredentialMetadata {
  credential: {
    display?: CredentialDisplay[]
    order?: string[]
    credential_subject?: CredentialSubjectRecord
  }
  issuer: {
    display?: OpenId4VciCredentialIssuerMetadataDisplay[]
    id: string
  }
}

type CredentialSupported = {
  credential_metadata?: {
    display?: Array<Record<string, any>>
    claims?: Array<{
      path?: Array<string | number>
      display?: Array<{
        name: string
        locale?: string
      }>
    }>
  }
  format?: string
}

export type OpenId4VcCredentialMetadataExtended = Partial<
  CredentialSupported & { credential_subject: CredentialSubjectRecord }
>

export type OpenIDCredentialNotificationMetadata = {
  notificationMetadata?: OpenId4VciMetadata
  tokenResponse?: OpenId4VciRequestTokenResponse
}

const normalizeImage = (image?: Record<string, any>) => {
  if (!image) return undefined

  const uri = image.uri ?? image.url
  if (!uri) return undefined

  return {
    uri,
    altText: image.altText ?? image.alt_text,
  }
}

const normalizeCredentialDisplay = (display: Record<string, any>): CredentialDisplay => ({
  locale: display.locale,
  name: display.name,
  description: display.description,
  textColor: display.textColor ?? display.text_color,
  backgroundColor: display.backgroundColor ?? display.background_color,
  backgroundImage: normalizeImage(display.backgroundImage ?? display.background_image),
  logo: normalizeImage(display.logo),
  primary_overlay_attribute: display.primary_overlay_attribute,
} as CredentialDisplay)

const normalizeIssuerDisplay = (display: OpenId4VciCredentialIssuerMetadataDisplay): OpenId4VciCredentialIssuerMetadataDisplay => {
  const normalized = {
    ...display,
    logo: normalizeImage((display as any).logo),
  }

  return normalized as OpenId4VciCredentialIssuerMetadataDisplay
}

const getClaimDisplayKey = (claimPath: Array<string | number> | undefined, format?: string): string | undefined => {
  if (!claimPath?.length) return undefined

  if (format === 'mso_mdoc' && claimPath.length > 1) {
    return String(claimPath[claimPath.length - 1])
  }

  return String(claimPath[0])
}

const claimsToCredentialSubject = (
  claims: NonNullable<CredentialSupported['credential_metadata']>['claims'],
  format?: string
): CredentialSubjectRecord | undefined => {
  if (!claims?.length) return undefined

  const credentialSubject: CredentialSubjectRecord = {}
  for (const claim of claims) {
    const key = getClaimDisplayKey(claim.path, format)
    if (!key || !claim.display?.length || credentialSubject[key]) continue

    credentialSubject[key] = {
      display: claim.display,
    }
  }

  return Object.keys(credentialSubject).length ? credentialSubject : undefined
}

const claimsToOrder = (
  claims: NonNullable<CredentialSupported['credential_metadata']>['claims'],
  format?: string
): string[] | undefined => {
  if (!claims?.length) return undefined

  const order: string[] = []
  const seen = new Set<string>()
  for (const claim of claims) {
    const key = getClaimDisplayKey(claim.path, format)
    if (!key || seen.has(key)) continue

    seen.add(key)
    order.push(key)
  }

  return order.length ? order : undefined
}

export function extractOpenId4VcCredentialMetadata(
  credentialMetadata: Partial<CredentialSupported>,
  serverMetadata: { display?: OpenId4VciCredentialIssuerMetadataDisplay[]; id: string }
): OpenId4VcCredentialMetadata {
  const metadata = credentialMetadata.credential_metadata

  return {
    credential: {
      display: metadata?.display?.map(normalizeCredentialDisplay),
      order: claimsToOrder(metadata?.claims, credentialMetadata.format),
      credential_subject: claimsToCredentialSubject(metadata?.claims, credentialMetadata.format),
    },
    issuer: {
      display: serverMetadata.display?.map(normalizeIssuerDisplay),
      id: serverMetadata.id,
    },
  }
}

/**
 * Gets the OpenId4Vc credential metadata from the given W3C credential record.
 */
export function getOpenId4VcCredentialMetadata(
  credentialRecord: OpenIDCredentialRecord
): OpenId4VcCredentialMetadata | null {
  return credentialRecord.metadata.get(openId4VcCredentialMetadataKey)
}

/**
 * Sets the OpenId4Vc credential metadata on the given W3cCredentialRecord or SdJwtVcRecord.
 *
 * NOTE: this does not save the record.
 */
export function setOpenId4VcCredentialMetadata(
  credentialRecord: OpenIDCredentialRecord,
  metadata: OpenId4VcCredentialMetadata
) {
  credentialRecord.metadata.set(openId4VcCredentialMetadataKey, metadata)
}

/**
 * Gets the refresh credential metadata from the given credential record.
 */
export function getRefreshCredentialMetadata(
  credentialRecord: OpenIDCredentialRecord
): RefreshCredentialMetadata | null {
  return credentialRecord.metadata.get(refreshCredentialMetadataKey)
}

/**
 * Sets the refresh credential metadata on the given credential record
 *
 * NOTE: this does not save the record.
 */
export function setRefreshCredentialMetadata(
  credentialRecord: OpenIDCredentialRecord,
  metadata: RefreshCredentialMetadata
) {
  credentialRecord.metadata.set(refreshCredentialMetadataKey, metadata)
}

export function deleteRefreshCredentialMetadata(
  credentialRecord: OpenIDCredentialRecord
) {
  credentialRecord.metadata.delete(refreshCredentialMetadataKey)
}

export async function persistCredentialRecord(
  agentContext: AgentContext,
  record: OpenIDCredentialRecord
) {
  if (record instanceof W3cCredentialRecord) {
    await agentContext.dependencyManager.resolve(W3cCredentialRepository).update(agentContext, record)
  } else if (record instanceof W3cV2CredentialRecord) {
    await agentContext.dependencyManager.resolve(W3cV2CredentialRepository).update(agentContext, record)
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
  credential: OpenIDCredentialRecord
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
