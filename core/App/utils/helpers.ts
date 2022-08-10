import {
  ConnectionRecord,
  CredentialExchangeRecord,
  ProofRecord,
  RequestedAttribute,
  RequestedPredicate,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useConnectionById, useCredentialById, useProofById } from '@aries-framework/react-hooks'
import { parseUrl } from 'query-string'

import { Attribute, Predicate } from '../types/record'

export { parsedCredDefName } from './cred-def'
export { parsedSchema } from './schema'

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

// DEPRECATED
export function credentialRecordFromId(credentialId?: string): CredentialExchangeRecord | void {
  if (credentialId) {
    return useCredentialById(credentialId)
  }
}

// DEPRECATED
export function connectionRecordFromId(connectionId?: string): ConnectionRecord | void {
  if (connectionId) {
    return useConnectionById(connectionId)
  }
}

// DEPRECATED
export function proofRecordFromId(proofId?: string): ProofRecord | void {
  if (proofId) {
    return useProofById(proofId)
  }
}

// DEPRECATED
export function getConnectionName(connection: ConnectionRecord | void): string | void {
  if (!connection) {
    return
  }
  return connection?.alias || connection?.theirLabel
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

export const processProofAttributes = (proof: ProofRecord, credentials?: RetrievedCredentials): Attribute[] => {
  const processedAttributes = [] as Attribute[]

  if (!credentials) {
    return processedAttributes
  }

  const { requestedAttributes: retrievedCredentialAttributes } = credentials
  const { requestedAttributes: requestedProofAttributes } = proof.requestMessage?.indyProofRequest || {}

  requestedProofAttributes?.forEach(({ name, names }, attributeName) => {
    const firstCredential = firstValidCredential(retrievedCredentialAttributes[attributeName] || [])
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

export const processProofPredicates = (proof: ProofRecord, credentials?: RetrievedCredentials): Predicate[] => {
  const processedPredicates = [] as Predicate[]

  if (!credentials) {
    return processedPredicates
  }

  const { requestedPredicates: retrievedCredentialPredicates } = credentials
  const { requestedPredicates: requestedProofPredicates } = proof.requestMessage?.indyProofRequest || {}

  requestedProofPredicates?.forEach(({ name, predicateType, predicateValue }, predicateName) => {
    const firstCredential = firstValidCredential(retrievedCredentialPredicates[predicateName] || [])
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
