import {
  Agent,
  ConnectionRecord,
  CredentialExchangeRecord,
  RequestedAttribute,
  RequestedPredicate,
  RetrievedCredentials,
  IndyCredentialInfo,
  IndyRetrievedCredentialsFormat,
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

/**
 * @deprecated The function should not be used
 */
export function connectionRecordFromId(connectionId?: string): ConnectionRecord | void {
  if (connectionId) {
    return useConnectionById(connectionId)
  }
}

/**
 * @deprecated The function should not be used
 */
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

/**
 * A sorting function for the Array `sort()` function
 * @param a First retrieved credential
 * @param b Second retrieved credential
 */
export const credentialSortFn = (a: any, b: any) => {
  if (a.revoked && !b.revoked) {
    return 1
  } else if (!a.revoked && b.revoked) {
    return -1
  } else {
    return b.timestamp - a.timestamp
  }
}

//TODO:(jl) Better type than "any" for format?
export const processProofAttributes = (format?: any, credentials?: IndyRetrievedCredentialsFormat): Attribute[] => {
  const processedAttributes = [] as Attribute[]

  if (!format || !credentials) {
    return processedAttributes
  }

  const { requestedAttributes } = credentials

  for (const key of Object.keys(requestedAttributes)) {
    const credential = (requestedAttributes[key] ?? []).sort(credentialSortFn).shift()
    if (!credential) {
      return processedAttributes
    }

    const { credentialId, revoked, credentialInfo } = credential
    const name = format.request.indy['requested_attributes'][key]['name']
    const value = (credentialInfo as IndyCredentialInfo).attributes[name]
    processedAttributes.push({
      credentialId,
      revoked,
      name,
      value,
    })
  }

  return processedAttributes
}

export const processProofPredicates = (format?: any, credentials?: IndyRetrievedCredentialsFormat): Predicate[] => {
  const processedPredicates = [] as Predicate[]

  if (!format || !credentials) {
    return processedPredicates
  }

  const { requestedPredicates } = credentials

  for (const key of Object.keys(requestedPredicates)) {
    const credential = (requestedPredicates[key] ?? []).sort(credentialSortFn).shift()
    if (!credential) {
      return processedPredicates
    }

    const { credentialId, revoked } = credential
    const { name, p_type: pType, p_value: pValue } = format.request.indy['requested_predicates'][key]

    processedPredicates.push({
      credentialId,
      name,
      revoked,
      pValue,
      pType,
    })
  }

  return processedPredicates
}

/**
 * @deprecated The function should not be used
 */
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
export const receiveMessageFromDeepLink = async (url: string, agent: Agent | undefined) => {
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
  const invitation = await agent?.oob.parseInvitation(uri)

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
