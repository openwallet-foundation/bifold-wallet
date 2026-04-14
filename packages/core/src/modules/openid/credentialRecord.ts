import {
  Agent,
  ClaimFormat,
  MdocRecord,
  SdJwtVcRecord,
  W3cCredentialRecord,
  W3cV2CredentialRecord,
} from '@credo-ts/core'
import { OpenId4VPRequestRecord, OpenIDCredentialType } from './types'

export type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord

export type OpenIDCredentialRecordType = OpenIDCredentialType | 'W3cV2CredentialRecord'

export const isOpenIDCredentialRecord = (value: unknown): value is OpenIDCredentialRecord =>
  value instanceof W3cCredentialRecord ||
  value instanceof SdJwtVcRecord ||
  value instanceof MdocRecord ||
  value instanceof W3cV2CredentialRecord

export const isOpenIdProofRequestRecord = (value: unknown): value is OpenId4VPRequestRecord =>
  !!value && typeof value === 'object' && 'type' in value && value.type === 'OpenId4VPRequestRecord'

export const getOpenIDCredentialType = (record: OpenIDCredentialRecord): OpenIDCredentialRecordType => {
  if (record instanceof SdJwtVcRecord) {
    return OpenIDCredentialType.SdJwtVc
  }

  if (record instanceof MdocRecord) {
    return OpenIDCredentialType.Mdoc
  }

  if (record instanceof W3cV2CredentialRecord) {
    return 'W3cV2CredentialRecord'
  }

  return OpenIDCredentialType.W3cCredential
}

export const getOpenIDCredentialClaimFormat = (record: OpenIDCredentialRecord): ClaimFormat => {
  if (record instanceof SdJwtVcRecord) {
    return ClaimFormat.SdJwtW3cVc
  }

  if (record instanceof MdocRecord) {
    return ClaimFormat.MsoMdoc
  }

  const claimFormat = record.getTags()?.claimFormat
  return typeof claimFormat === 'string' ? (claimFormat as ClaimFormat) : ClaimFormat.JwtVc
}

export const toOpenIDCredentialLite = (record: OpenIDCredentialRecord) => ({
  id: record.id,
  format: getOpenIDCredentialClaimFormat(record),
  createdAt: record.createdAt?.toISOString(),
  issuer: undefined,
})

export async function storeOpenIDCredential(agent: Agent, record: OpenIDCredentialRecord) {
  if (record instanceof W3cCredentialRecord) {
    return agent.w3cCredentials.store({ record })
  }

  if (record instanceof W3cV2CredentialRecord) {
    return agent.w3cV2Credentials.store({ record })
  }

  if (record instanceof SdJwtVcRecord) {
    return agent.sdJwtVc.store({ record })
  }

  if (record instanceof MdocRecord) {
    return agent.mdoc.store({ record })
  }

  throw new Error(`Unsupported OpenID credential record type: ${(record as { type?: string })?.type ?? 'unknown'}`)
}

export async function deleteOpenIDCredential(agent: Agent, record: OpenIDCredentialRecord) {
  if (record instanceof W3cCredentialRecord) {
    return agent.w3cCredentials.deleteById(record.id)
  }

  if (record instanceof W3cV2CredentialRecord) {
    return agent.w3cV2Credentials.deleteById(record.id)
  }

  if (record instanceof SdJwtVcRecord) {
    return agent.sdJwtVc.deleteById(record.id)
  }

  if (record instanceof MdocRecord) {
    return agent.mdoc.deleteById(record.id)
  }

  throw new Error(`Unsupported OpenID credential record type: ${(record as { type?: string })?.type ?? 'unknown'}`)
}

export async function getOpenIDCredentialById(
  agent: Agent,
  type: OpenIDCredentialRecordType,
  id: string
): Promise<OpenIDCredentialRecord | undefined> {
  switch (type) {
    case OpenIDCredentialType.W3cCredential:
      return agent.w3cCredentials.getById(id)
    case 'W3cV2CredentialRecord':
      return agent.w3cV2Credentials.getById(id)
    case OpenIDCredentialType.SdJwtVc:
      return agent.sdJwtVc.getById(id)
    case OpenIDCredentialType.Mdoc:
      return agent.mdoc.getById(id)
    default:
      return undefined
  }
}

export async function findOpenIDCredentialById(agent: Agent, id: string): Promise<OpenIDCredentialRecord | undefined> {
  const lookups = await Promise.allSettled([
    agent.w3cCredentials.getById(id),
    agent.w3cV2Credentials.getById(id),
    agent.sdJwtVc.getById(id),
    agent.mdoc.getById(id),
  ])

  for (const lookup of lookups) {
    if (lookup.status === 'fulfilled' && lookup.value) {
      return lookup.value
    }
  }

  return undefined
}
