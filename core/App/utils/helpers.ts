import {
  Agent,
  ConnectionRecord,
  CredentialExchangeRecord,
  ProofRecord,
  RequestedAttribute,
  RequestedPredicate,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useConnectionById } from '@aries-framework/react-hooks'
import { Buffer } from 'buffer'
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
export function connectionRecordFromId(connectionId?: string): ConnectionRecord | void {
  if (connectionId) {
    return useConnectionById(connectionId)
  }
}

// DEPRECATED
export function getConnectionName(connection: ConnectionRecord | void): string | void {
  if (!connection) {
    return
  }
  return connection?.alias || connection?.theirLabel
}

export function getCredentialConnectionLabel(credential?: CredentialExchangeRecord) {
  if (!credential) {
    return ''
  }
  return credential?.connectionId
    ? useConnectionById(credential.connectionId)?.theirLabel
    : credential?.connectionId ?? ''
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

export const getOobDeepLink = async (url: string, agent: Agent | undefined): Promise<any> => {
  const queryParams = parseUrl(url).query
  const b64Message = queryParams['d_m'] ?? queryParams['c_i']
  const rawmessage = Buffer.from(b64Message as string, 'base64').toString()
  const message = JSON.parse(rawmessage)
  await agent?.receiveMessage(message)
  return message
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

/**
 *
 * @param url a redirection URL to retrieve a payload for an invite
 * @param agent an Agent instance
 * @returns payload from following the redirection
 */
export const receiveMessageFromUrlRedirect = async (url: string, agent: Agent | undefined) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  const message = await res.json()
  await agent?.receiveMessage(message)
  return message
}

/**
 *
 * @param url a redirection URL to retrieve a payload for an invite
 * @param agent an Agent instance
 * @returns payload from following the redirection
 */
export const receiveMessageFromDeeplink = async (url: string, agent: Agent | undefined) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  const message = await res.json()
  await agent?.receiveMessage(message)
  return message
}

/**
 *
 * @param uri a URI containing a base64 encoded connection invite in the query parameter
 * @param agent an Agent instance
 * @returns a connection record from parsing and receiving the invitation
 */
export const connectFromInvitation = async (uri: string, agent: Agent | undefined) => {
  const invitation = await agent?.oob.parseInvitationShortUrl(uri)
  if (!invitation) {
    throw new Error('Could not parse invitation from URL')
  }

  const record = await agent?.oob.receiveInvitation(invitation)
  const connectionRecord = record?.connectionRecord
  if (!connectionRecord?.id) {
    throw new Error('Connection does not have an ID')
  }
  return connectionRecord
}
