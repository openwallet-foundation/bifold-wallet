import {
  ConnectionRecord,
  CredentialMetadataKeys,
  CredentialExchangeRecord as CredentialRecord,
  ProofRecord,
  RequestedAttribute,
  RequestedPredicate,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useConnectionById, useCredentialById, useProofById } from '@aries-framework/react-hooks'
import { parseUrl } from 'query-string'

import { Attribute, Predicate } from '../types/record'

export function parseSchema(schemaId?: string): { name: string; version: string } {
  let name = 'Credential'
  let version = ''
  if (schemaId) {
    const schemaIdRegex = /(.*?):([0-9]):([a-zA-Z .\-_0-9]+):([a-z0-9._-]+)$/
    const schemaIdParts = schemaId.match(schemaIdRegex)
    if (schemaIdParts?.length === 5) {
      name = `${schemaIdParts?.[3].replace(/_|-/g, ' ')}`
        .split(' ')
        .map((schemaIdPart) => schemaIdPart.charAt(0).toUpperCase() + schemaIdPart.substring(1))
        .join(' ')
      version = schemaIdParts?.[4]
    }
  }
  return { name, version }
}

export function credentialSchema(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.schemaId
}

export function parsedSchema(credential: CredentialRecord): { name: string; version: string } {
  return parseSchema(credentialSchema(credential))
}

/**
 * Adapted from https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
 */
export function hashCode(s: string): number {
  return s.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0)
}

export function hashToRGBA(i: number) {
  const colour = (i & 0x00ffffff).toString(16).toUpperCase()
  return '#' + '00000'.substring(0, 6 - colour.length) + colour
}

export function credentialRecordFromId(credentialId?: string): CredentialRecord | void {
  if (credentialId) {
    return useCredentialById(credentialId)
  }
}

export function connectionRecordFromId(connectionId?: string): ConnectionRecord | void {
  if (connectionId) {
    return useConnectionById(connectionId)
  }
}

export function proofRecordFromId(proofId?: string): ProofRecord | void {
  if (proofId) {
    return useProofById(proofId)
  }
}

export function getConnectionName(connection: ConnectionRecord | void): string | void {
  if (!connection) {
    return
  }
  return connection?.alias
}

export function firstValidCredential(
  fields: RequestedAttribute[] | RequestedPredicate[],
  revoked = true
): RequestedAttribute | RequestedPredicate | null {
  if (!fields.length) {
    return null
  }

  let first = null
  const firstNonRevoked = fields.filter((field) => !field.revoked)[0]
  if (firstNonRevoked) {
    first = firstNonRevoked
  } else if (fields.length && revoked) {
    first = fields[0]
  }

  if (!first?.credentialInfo) {
    return null
  }

  return first
}

export const isRedirection = (url: string): boolean => {
  const queryParams = parseUrl(url).query
  return !(queryParams['c_i'] || queryParams['d_m'])
}

export const processProofAttributes = (
  proof: ProofRecord,
  attributes: Record<string, RequestedAttribute[]> = {}
): Attribute[] => {
  const processedAttributes = [] as Attribute[]
  const { requestedAttributes: requestedProofAttributes } = proof.requestMessage?.indyProofRequest || {}

  requestedProofAttributes?.forEach(({ name, names }, attributeName) => {
    const firstCredential = firstValidCredential(attributes[attributeName] || [])
    const credentialAttributes = names?.length ? names : [name || attributeName]
    credentialAttributes.forEach((attribute) => {
      processedAttributes.push({
        name: attribute,
        value: firstCredential?.credentialInfo?.attributes[attribute] || null,
        revoked: firstCredential?.revoked || false,
        credentialId: firstCredential?.credentialId,
      })
    })
  })
  return processedAttributes
}

export const processProofPredicates = (
  proof: ProofRecord,
  predicates: Record<string, RequestedPredicate[]> = {}
): Predicate[] => {
  const processedPredicates = [] as Predicate[]
  const { requestedPredicates: requestedProofPredicates } = proof.requestMessage?.indyProofRequest || {}

  requestedProofPredicates?.forEach(({ name, predicateType, predicateValue }, predicateName) => {
    const firstCredential = firstValidCredential(predicates[predicateName] || [])
    const predicate = name || predicateName
    processedPredicates.push({
      name: predicate,
      pValue: predicateValue,
      pType: predicateType,
      revoked: firstCredential?.revoked || false,
      credentialId: firstCredential?.credentialId,
    })
  })
  return processedPredicates
}

export const sortCredentialsForAutoSelect = (credentials: RetrievedCredentials): RetrievedCredentials => {
  const requestedAttributes = Object.values(credentials?.requestedAttributes).pop()
  const requestedPredicates = Object.values(credentials?.requestedPredicates).pop()
  const sortFn = (a: any, b: any) => {
    if (a.revoked && !b.revoked) {
      return 1
    } else if (!a.revoked && b.revoked) {
      return -1
    } else {
      return b.timestamp - a.timestamp
    }
  }

  requestedAttributes && requestedAttributes.sort(sortFn)
  requestedPredicates && requestedPredicates.sort(sortFn)

  return credentials
}
