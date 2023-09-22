import {
  AnonCredsCredentialInfo,
  AnonCredsCredentialsForProofRequest,
  AnonCredsPredicateType,
  AnonCredsProofFormat,
  AnonCredsProofFormatService,
  AnonCredsProofRequestRestriction,
  AnonCredsRequestedAttributeMatch,
  AnonCredsRequestedPredicateMatch,
  LegacyIndyProofFormat,
  LegacyIndyProofFormatService,
} from '@aries-framework/anoncreds'
import {
  Agent,
  ConnectionRecord,
  CredentialExchangeRecord,
  CredentialState,
  BasicMessageRecord,
  ProofExchangeRecord,
  ProofState,
} from '@aries-framework/core'
import { BasicMessageRole } from '@aries-framework/core/build/modules/basic-messages/BasicMessageRole'
import {
  GetCredentialsForRequestReturn,
  ProofFormatDataMessagePayload,
} from '@aries-framework/core/build/modules/proofs/protocol/ProofProtocolOptions'
import { useConnectionById } from '@aries-framework/react-hooks'
import {
  Attribute,
  Predicate,
  ProofCredentialAttributes,
  ProofCredentialItems,
  ProofCredentialPredicates,
} from '@hyperledger/aries-oca/build/legacy'
import { Buffer } from 'buffer'
import moment from 'moment'
import { ParsedUrl, parseUrl } from 'query-string'
import { Dispatch, ReactNode, SetStateAction } from 'react'

import { EventTypes, domain } from '../constants'
import { i18n } from '../localization/index'
import { Role } from '../types/chat'
import { ChildFn } from '../types/tour'

export { parsedCredDefNameFromCredential } from './cred-def'
import { parseCredDefFromId } from './cred-def'
import { BifoldAgent } from './agent'
import { BifoldError } from '../types/error'
import { DeviceEventEmitter } from 'react-native'
import { TFunction } from 'react-i18next'

export { parsedCredDefName } from './cred-def'
export { parsedSchema } from './schema'

export enum Orientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
}

export const orientation = (width: number, height: number) => {
  return width > height ? Orientation.Landscape : Orientation.Portrait
}

export const isTablet = (width: number, height: number) => {
  const aspectRatio = height / width

  return aspectRatio < 1.6 // assume 4:3 for tablets
}

/**
 * Generates a numerical hash based on a given string
 * @see https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
 * @param { string } s given string
 * @returns { number } numerical hash value
 */
export const hashCode = (s: string): number => {
  return s.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0)
}

/**
 * Generates a pseudorandom number between 0 and 1 based on a seed
 * @see https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
 * @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 * @param { number } seed any number
 * @returns { number } pseudorandom number between 0 and 1
 */
const mulberry32 = (seed: number) => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Converts a numerical hash into a hexidecimal color string
 * @see https://helderesteves.com/generating-random-colors-js/#Generating_random_dark_colors
 * @param { number } hash numerical hash value (generated by hashCode function above)
 * @returns { string } hexidecimal string eg. #32d3cc
 */
export const hashToRGBA = (hash: number) => {
  let color = '#'
  const colorRangeUpperBound = 256

  // once for r, g, b
  for (let i = 0; i < 3; i++) {
    // append a pseudorandom two-char hexidecimal value from the lower half of the color spectrum (to limit to darker colors)
    color += ('0' + Math.floor((mulberry32(hash + i) * colorRangeUpperBound) / 2).toString(16)).slice(-2)
  }

  return color
}
/**
 *
 * @param time
 * @param params see below
 * shortMonth: whether to use Jun in place of June, Mar in place of March for example (overridden by `format`)
 * format: an optional custom moment format string to create the formatted date from
 * includeHour: whether to add the hour and minute and am/pm. eg 9:32 pm (overridden by `chatFormat` and `trim`)
 * chatFormat: whether to style the date to appear like a chat message timestamp eg. '7 minutes ago' or 'Just now'
 * trim: if true, if it's the same day the date will be trimmed to just the hour, if it's the same year then the year will be trimmed from the date
 * eg. if the current year is 2023, February 12, 2023 will be trimmed to February 12
 * @returns formatted time string
 */
export function formatTime(
  time: Date,
  params?: { shortMonth?: boolean; format?: string; includeHour?: boolean; chatFormat?: boolean; trim?: boolean }
): string {
  const getMonthKey = 'MMMM'
  const momentTime = moment(time)
  const monthKey = momentTime.format(getMonthKey)
  const customMonthFormatRe = /M+/
  const shortMonth = params?.shortMonth
  const format = params?.format
  const includeHour = params?.includeHour
  const chatFormat = params?.chatFormat
  const trim = params?.trim
  const shortDateFormatMaskLength = 3
  const millisecondsAgo = moment().diff(momentTime)
  const lessThanAMinuteAgo = millisecondsAgo / 1000 / 60 < 1
  const lessThanAnHourAgo = millisecondsAgo / 1000 / 60 / 60 < 1
  const now = new Date()
  const sameYear = time.getFullYear() === now.getFullYear()
  const sameDay = time.getDate() === now.getDate() && time.getMonth() === now.getMonth() && sameYear
  const isNonEnglish = i18n.resolvedLanguage === 'fr' || i18n.resolvedLanguage === 'pt-BR'

  // for the shortened approach eg. in chat bubbles
  if (chatFormat) {
    if (lessThanAMinuteAgo) {
      return i18n.t('Date.JustNow')
    }
    if (lessThanAnHourAgo) {
      const minutesAgo = Math.floor(millisecondsAgo / 1000 / 60)
      return minutesAgo === 1 ? `1 ${i18n.t('Date.MinuteAgo')}` : `${minutesAgo} ${i18n.t('Date.MinutesAgo')}`
    }
    if (sameDay) {
      return momentTime.format('h:mm a')
    }
  }

  let formatString = i18n.t('Date.ShortFormat')
  let formattedTime = ''
  // if sameDay and abbreviated
  if (sameDay && trim) {
    return momentTime.format('h:mm a')
  }

  if (format) {
    formatString = format
    formattedTime = momentTime.format(format)
  } else {
    if (!shortMonth) {
      formatString = i18n.t('Date.LongFormat')
    }

    // if translation fails
    if (formatString === 'Date.ShortFormat' || formatString === 'Date.LongFormat' || formatString === undefined) {
      formatString = 'MMM D'
    }

    // if trim is true, don't include the year for same year times
    formattedTime =
      trim && sameYear
        ? momentTime.format(formatString)
        : // if non-english, don't include comma between year and month
        isNonEnglish
          ? `${momentTime.format(formatString)} ${momentTime.format('YYYY')}`
          : `${momentTime.format(formatString)}, ${momentTime.format('YYYY')}`
    if (includeHour) {
      formattedTime = `${formattedTime}, ${momentTime.format('h:mm a')}`
    }
  }

  const customMonthFormat = formatString?.match(customMonthFormatRe)?.[0]

  if (customMonthFormat) {
    let monthReplacement = ''
    const monthReplacementKey = momentTime.format(customMonthFormat)
    if (customMonthFormat.length === shortDateFormatMaskLength) {
      // then we know we're dealing with a short date format: 'MMM'
      monthReplacement = i18n.t(`Date.MonthShort.${monthKey}`)
    } else if (customMonthFormat.length > shortDateFormatMaskLength) {
      // then we know we're working with a long date format: 'MMMM'
      monthReplacement = i18n.t(`Date.MonthLong.${monthKey}`)
    }
    // if translation doesn't work
    if (monthReplacement === `Date.MonthLong.${monthKey}` || monthReplacement === `Date.MonthShort.${monthKey}`) {
      monthReplacement = monthReplacementKey
    }

    if (monthReplacement) {
      formattedTime = formattedTime.replace(monthReplacementKey, monthReplacement)
    }
  }
  return formattedTime
}

export function formatIfDate(
  format: string | undefined,
  value: string | number | null,
  setter: Dispatch<SetStateAction<string | number | null>>
) {
  const potentialDate = value ? value.toString() : null
  if (format === 'YYYYMMDD' && potentialDate && potentialDate.length === format.length) {
    const year = potentialDate.substring(0, 4)
    const month = potentialDate.substring(4, 6)
    const day = potentialDate.substring(6, 8)
    // NOTE: JavaScript counts months from 0 to 11: January = 0, December = 11.
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getDate())) {
      setter(formatTime(date, { shortMonth: true }))
    }
  }
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

  if (credential.connectionId) {
    const connection = useConnectionById(credential.connectionId)
    return connection?.alias || connection?.theirLabel || credential.connectionId
  }

  return 'Unknown Contact'
}

export function getConnectionImageUrl(connectionId: string) {
  const connection = useConnectionById(connectionId)
  if (!connection) {
    return undefined
  }
  return connection.imageUrl ?? undefined
}

export function firstValidCredential(
  fields: AnonCredsRequestedAttributeMatch[] | AnonCredsRequestedPredicateMatch[],
  revoked = true
): AnonCredsRequestedAttributeMatch | AnonCredsRequestedPredicateMatch | null {
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

const credNameFromRestriction = (queries?: AnonCredsProofRequestRestriction[]): string => {
  let schema_name = ''
  let cred_def_id = ''
  let schema_id = ''
  queries?.forEach((query) => {
    schema_name = (query?.schema_name as string) ?? schema_name
    cred_def_id = (query?.cred_def_id as string) ?? cred_def_id
    schema_id = (query?.schema_id as string) ?? schema_id
  })
  if (schema_name && (schema_name.toLowerCase() !== 'default' || schema_name.toLowerCase() !== 'credential')) {
    return schema_name
  } else {
    return parseCredDefFromId(cred_def_id, schema_id)
  }
}

export const isDataUrl = (value: string | number | null) => {
  return typeof value === 'string' && value.startsWith('data:image/')
}
export type Fields = Record<string, AnonCredsRequestedAttributeMatch[] | AnonCredsRequestedPredicateMatch[]>

/**
   * Retrieve current credentials info filtered by `credentialDefinitionId` if given.
   * @param credDefId Credential Definition Id
   * @returns Array of `AnonCredsCredentialInfo`
   */
export const getCredentialInfo = (credId: string, fields: Fields): AnonCredsCredentialInfo[] => {
  const credentialInfo: AnonCredsCredentialInfo[] = []

  Object.keys(fields).forEach((proofKey) => {
    credentialInfo.push(...fields[proofKey].map((attr) => attr.credentialInfo))
  })

  return !credId
    ? credentialInfo
    : credentialInfo.filter((cred) => cred.credentialId === credId)
}

/**
   * Evaluate if given attribute value satisfies the predicate.
   * @param attribute Credential attribute value
   * @param pValue Predicate value
   * @param pType Predicate type ({@link AnonCredsPredicateType})
   * @returns `true`if predicate is satisfied, otherwise `false`
   */
const evaluateOperation = (attribute: number, pValue: number, pType: AnonCredsPredicateType): boolean => {
  if (pType === '>=') {
    return attribute >= pValue
  }

  if (pType === '>') {
    return attribute > pValue
  }

  if (pType === '<=') {
    return attribute <= pValue
  }
  if (pType === '<') {
    return attribute < pValue
  }

  return false
}

/**
 * Given proof credential items, evaluate and return its predicates, setting `satisfied` property.
 * @param proofCredentialsItems
 * @returns Array of evaluated predicates
 */
export const evaluatePredicates =
  (fields: Fields, credId?: string) =>
    (proofCredentialItems: ProofCredentialItems): Predicate[] => {
      const predicates = proofCredentialItems.predicates
      if (!predicates || predicates.length == 0) {
        return []
      }

      if (credId && credId != proofCredentialItems.credId || !proofCredentialItems.credId) {
        return []
      }

      const credentialAttributes = getCredentialInfo(proofCredentialItems.credId, fields).map((ci) => ci.attributes)

      return predicates.map((predicate) => {
        const { pType: pType, pValue: pValue, name: field } = predicate
        let satisfied = false

        if (field) {
          const attribute = (credentialAttributes.find((attr) => attr[field] != undefined) ?? {})[field]

          if (attribute && pValue) {
            satisfied = evaluateOperation(Number(attribute), Number(pValue), pType as AnonCredsPredicateType)
          }
        }

        return { ...predicate, satisfied }
      })
    }


export const retrieveCredentialsForProof = async (agent: BifoldAgent, proof: ProofExchangeRecord, fullCredentials: CredentialExchangeRecord[], t: TFunction<"translation", undefined>) => {
  try {
    const format = await agent.proofs.getFormatData(proof.id)
    const hasAnonCreds = format.request?.anoncreds !== undefined
    const hasIndy = format.request?.indy !== undefined
    const credentials = await agent.proofs.getCredentialsForRequest({
      proofRecordId: proof.id,
      proofFormats: {
        // FIXME: AFJ will try to use the format, even if the value is undefined (but the key is present)
        // We should ignore the key, if the value is undefined. For now this is a workaround.
        ...(hasIndy
          ? {
            indy: {
              // Setting `filterByNonRevocationRequirements` to `false` returns all
              // credentials even if they are revokable (and revoked). We need this to
              // be able to show why a proof cannot be satisfied. Otherwise we can only
              // show failure.
              filterByNonRevocationRequirements: false,
            },
          }
          : {}),

        ...(hasAnonCreds
          ? {
            anoncreds: {
              // Setting `filterByNonRevocationRequirements` to `false` returns all
              // credentials even if they are revokable (and revoked). We need this to
              // be able to show why a proof cannot be satisfied. Otherwise we can only
              // show failure.
              filterByNonRevocationRequirements: false,
            },
          }
          : {}),
      },
    })
    if (!credentials) {
      throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
    }

    if (!format) {
      throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
    }

    if (!(format && credentials && fullCredentials)) {
      return
    }

    const proofFormat = credentials.proofFormats.anoncreds ?? credentials.proofFormats.indy

    const attributes = processProofAttributes(format.request, credentials, fullCredentials)
    const predicates = processProofPredicates(format.request, credentials, fullCredentials)

    const groupedProof = Object.values(mergeAttributesAndPredicates(attributes, predicates))
    return { groupedProof: groupedProof, retrievedCredentials: proofFormat, fullCredentials }
  } catch (err: unknown) {
    const error = new BifoldError(
      t('Error.Title1043'),
      t('Error.Message1043'),
      (err as Error)?.message ?? err,
      1043
    )
    DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
  }
}

export const processProofAttributes = (
  request?: ProofFormatDataMessagePayload<[LegacyIndyProofFormat, AnonCredsProofFormat], 'request'> | undefined,
  credentials?: GetCredentialsForRequestReturn<[LegacyIndyProofFormatService, AnonCredsProofFormatService]>,
  credentialRecords?: CredentialExchangeRecord[],
): { [key: string]: ProofCredentialAttributes } => {
  const processedAttributes = {} as { [key: string]: ProofCredentialAttributes }

  const requestedProofAttributes = request?.indy?.requested_attributes ?? request?.anoncreds?.requested_attributes
  const retrievedCredentialAttributes =
    credentials?.proofFormats?.indy?.attributes ?? credentials?.proofFormats?.anoncreds?.attributes

  if (!requestedProofAttributes || !retrievedCredentialAttributes) {
    return {}
  }

  for (const key of Object.keys(retrievedCredentialAttributes)) {
    const altCredentials = [...(retrievedCredentialAttributes[key] ?? [])].sort(credentialSortFn).map(cred => cred.credentialId)

    let credentialList = [...(retrievedCredentialAttributes[key] ?? [])].sort(credentialSortFn)

    //iterate over all credentials that satisfy the proof
    for (const credential of credentialList) {

      const credNameRestriction = credNameFromRestriction(requestedProofAttributes[key]?.restrictions)

      let credName = credNameRestriction ?? key
      if (credential?.credentialInfo?.credentialDefinitionId || credential?.credentialInfo?.schemaId) {
        credName = parseCredDefFromId(
          credential?.credentialInfo?.credentialDefinitionId,
          credential?.credentialInfo?.schemaId
        )
      }
      let revoked = false
      let credExchangeRecord = undefined
      if (credential) {
        credExchangeRecord = credentialRecords?.find(
          (record) => record.credentials.map(cred => cred.credentialRecordId).includes(credential.credentialId)
        )
        revoked = credExchangeRecord?.revocationNotification !== undefined
      } else {
        continue
      }

      const { name, names, non_revoked } = requestedProofAttributes[key]

      for (const attributeName of [...(names ?? (name && [name]) ?? [])]) {
        if (!processedAttributes[credential?.credentialId]) {
          // init processedAttributes object
          processedAttributes[credential.credentialId] = {
            credExchangeRecord,
            altCredentials,
            credId: credential?.credentialId,
            schemaId: credential?.credentialInfo?.schemaId,
            credDefId: credential?.credentialInfo?.credentialDefinitionId,
            credName,
            attributes: [],
          }
        }

        let attributeValue = ''
        if (credential) {
          attributeValue = credential.credentialInfo.attributes[attributeName]
        }
        processedAttributes[credential.credentialId].attributes?.push(
          new Attribute({
            revoked,
            credentialId: credential.credentialId,
            name: attributeName,
            value: attributeValue,
            nonRevoked: non_revoked
          })
        )
      }
    }
  }
  return processedAttributes
}

export const processProofPredicates = (
  request?: ProofFormatDataMessagePayload<[LegacyIndyProofFormat, AnonCredsProofFormat], 'request'> | undefined,
  credentials?: GetCredentialsForRequestReturn<[LegacyIndyProofFormatService, AnonCredsProofFormatService]>,
  credentialRecords?: CredentialExchangeRecord[],
): { [key: string]: ProofCredentialPredicates } => {
  const processedPredicates = {} as { [key: string]: ProofCredentialPredicates }

  const requestedProofPredicates = request?.anoncreds?.requested_predicates ?? request?.indy?.requested_predicates
  const retrievedCredentialPredicates =
    credentials?.proofFormats?.anoncreds?.predicates ?? credentials?.proofFormats?.indy?.predicates

  if (!requestedProofPredicates || !retrievedCredentialPredicates) {
    return {}
  }

  for (const key of Object.keys(requestedProofPredicates)) {
    const altCredentials = [...(retrievedCredentialPredicates[key] ?? [])].sort(credentialSortFn).map(cred => cred.credentialId)

    let credentialList = [...(retrievedCredentialPredicates[key] ?? [])].sort(credentialSortFn)

    for (const credential of credentialList) {

      let revoked = false
      let credExchangeRecord = undefined
      if (credential) {
        credExchangeRecord = credentialRecords?.find(
          (record) => record.credentials.map(cred => cred.credentialRecordId).includes(credential.credentialId)
        )
        revoked = credExchangeRecord?.revocationNotification !== undefined
      } else {
        continue
      }
      const { credentialDefinitionId, schemaId } = { ...credential, ...credential?.credentialInfo }
      const { name, p_type: pType, p_value: pValue, non_revoked } = requestedProofPredicates[key]

      const credNameRestriction = credNameFromRestriction(requestedProofPredicates[key]?.restrictions)

      let credName = credNameRestriction ?? key
      if (credential?.credentialInfo?.credentialDefinitionId || credential?.credentialInfo?.schemaId) {
        credName = parseCredDefFromId(
          credential?.credentialInfo?.credentialDefinitionId,
          credential?.credentialInfo?.schemaId
        )
      }

      if (!processedPredicates[credential.credentialId]) {
        processedPredicates[credential.credentialId] = {
          altCredentials,
          credExchangeRecord,
          credId: credential.credentialId,
          schemaId,
          credDefId: credentialDefinitionId,
          credName: credName,
          predicates: [],
        }
      }

      processedPredicates[credential.credentialId].predicates?.push(
        new Predicate({
          credentialId: credential?.credentialId,
          name,
          revoked,
          pValue,
          pType,
          nonRevoked: non_revoked
        })
      )
    }
  }
  return processedPredicates
}

export const mergeAttributesAndPredicates = (
  attributes: { [key: string]: ProofCredentialAttributes },
  predicates: { [key: string]: ProofCredentialPredicates }
) => {
  const merged: { [key: string]: ProofCredentialAttributes & ProofCredentialPredicates } = { ...attributes }
  for (const [key, predicate] of Object.entries(predicates)) {
    const existingEntry = merged[key]
    if (existingEntry) {
      const mergedAltCreds = existingEntry.altCredentials?.filter(credId => predicate.altCredentials?.includes(credId))
      merged[key] = { ...existingEntry, ...predicate }
      merged[key].altCredentials = mergedAltCreds
    } else {
      merged[key] = predicate
    }
  }
  return merged
}

/**
 * @deprecated The function should not be used
 */
export const sortCredentialsForAutoSelect = (
  credentials: AnonCredsCredentialsForProofRequest
): AnonCredsCredentialsForProofRequest => {
  const requestedAttributes = Object.values(credentials?.attributes).pop()
  const requestedPredicates = Object.values(credentials?.predicates).pop()
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

/**
 * Create a new connection invitation
 *
 * @param agent an Agent instance
 * @param goalCode add goalCode to connection invitation
 * @returns a connection record
 */
export const createConnectionInvitation = async (agent: Agent | undefined, goalCode?: string) => {
  const record = await agent?.oob.createInvitation({ goalCode })
  if (!record) {
    throw new Error('Could not create new invitation')
  }

  const invitationUrl = record.outOfBandInvitation.toUrl({ domain })

  return {
    record,
    invitation: record.outOfBandInvitation,
    invitationUrl,
  }
}

/**
 * Create a new connection invitation with a goal code specifying that it will be deleted after issuing or verifying once depending on type
 *
 * @param agent an Agent instance
 * @param type add goalCode to connection invitation
 * @returns a connection record
 */
export const createTempConnectionInvitation = async (agent: Agent | undefined, type: 'issue' | 'verify') => {
  return createConnectionInvitation(agent, `aries.vc.${type}.once`)
}

/**
 * Parse URL from provided string
 * @param urlString string to parse
 * @returns ParsedUur object if success or undefined
 */
export const getUrl = (urlString: string): ParsedUrl | undefined => {
  try {
    return parseUrl(urlString)
  } catch (e) {
    return undefined
  }
}

/**
 * Parse JSON from provided string
 * @param jsonString string to parse
 * @returns JSON object if success or undefined
 */
export const getJson = (jsonString: string): Record<string, unknown> | undefined => {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return undefined
  }
}

/**
 * Typeguard to check if any React children is represented as a function
 * instead of a Node. I,e., when it's a {@link ChildFn}.
 *
 * @param children any React children
 * @returns true if the children is a function, false otherwise
 */
export function isChildFunction<T>(children: ReactNode | ChildFn<T>): children is ChildFn<T> {
  return typeof children === 'function'
}

export function getCredentialEventRole(record: CredentialExchangeRecord) {
  switch (record.state) {
    // assuming only Holder states are supported here
    case CredentialState.ProposalSent:
      return Role.me
    case CredentialState.OfferReceived:
      return Role.them
    case CredentialState.RequestSent:
      return Role.me
    case CredentialState.Declined:
      return Role.me
    case CredentialState.CredentialReceived:
      return Role.me
    case CredentialState.Done:
      return Role.me
    default:
      return Role.me
  }
}

export function getCredentialEventLabel(record: CredentialExchangeRecord) {
  switch (record.state) {
    // assuming only Holder states are supported here
    case CredentialState.ProposalSent:
      return 'Chat.CredentialProposalSent'
    case CredentialState.OfferReceived:
      return 'Chat.CredentialOfferReceived'
    case CredentialState.RequestSent:
      return 'Chat.CredentialRequestSent'
    case CredentialState.Declined:
      return 'Chat.CredentialDeclined'
    case CredentialState.CredentialReceived:
    case CredentialState.Done:
      return 'Chat.CredentialReceived'
    default:
      return ''
  }
}

export function getProofEventRole(record: ProofExchangeRecord) {
  switch (record.state) {
    case ProofState.RequestSent:
      return Role.me
    case ProofState.ProposalReceived:
      return Role.me
    case ProofState.PresentationReceived:
      return Role.them
    case ProofState.RequestReceived:
      return Role.me
    case ProofState.ProposalSent:
    case ProofState.PresentationSent:
      return Role.me
    case ProofState.Declined:
      return Role.me
    case ProofState.Abandoned:
      return Role.them
    case ProofState.Done:
      return record.isVerified !== undefined ? Role.them : Role.me
    default:
      return Role.me
  }
}

export function getProofEventLabel(record: ProofExchangeRecord) {
  switch (record.state) {
    case ProofState.RequestSent:
    case ProofState.ProposalReceived:
      return 'Chat.ProofRequestSent'
    case ProofState.PresentationReceived:
      return 'Chat.ProofPresentationReceived'
    case ProofState.RequestReceived:
      return 'Chat.ProofRequestReceived'
    case ProofState.ProposalSent:
    case ProofState.PresentationSent:
      return 'Chat.ProofRequestSatisfied'
    case ProofState.Declined:
      return 'Chat.ProofRequestRejected'
    case ProofState.Abandoned:
      return 'Chat.ProofRequestRejectReceived'
    case ProofState.Done:
      return record.isVerified !== undefined ? 'Chat.ProofPresentationReceived' : 'Chat.ProofRequestSatisfied'
    default:
      return ''
  }
}

export function getMessageEventRole(record: BasicMessageRecord) {
  return record.role === BasicMessageRole.Sender ? Role.me : Role.them
}

export function generateRandomWalletName() {
  let name = 'My Wallet - '
  for (let i = 0; i < 4; i++) {
    name = name.concat(Math.floor(Math.random() * 10).toString())
  }
  return name
}
