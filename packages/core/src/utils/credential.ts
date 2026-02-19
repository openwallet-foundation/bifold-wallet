import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import type { Agent } from '@credo-ts/core'
import { DidCommCredentialExchangeRecord, DidCommCredentialState } from '@credo-ts/didcomm'
import { ImageSourcePropType } from 'react-native'

import { luminanceForHexColor } from './luminance'
import { getSchemaName, getCredDefTag, fallbackDefaultCredentialNameValue, defaultCredDefTag } from './cred-def'
import { BifoldLogger } from '../services/logger'

export const isValidAnonCredsCredential = (credential: DidCommCredentialExchangeRecord) => {
  return (
    credential &&
    (credential.state === DidCommCredentialState.OfferReceived ||
      (Boolean(credential.metadata.get(AnonCredsCredentialMetadataKey)) &&
        credential.credentials.find((c) => c.credentialRecordType === 'anoncreds' || c.credentialRecordType === 'w3c')))
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const credentialTextColor = (ColorPalette: any, hex?: string) => {
  const midpoint = 255 / 2
  if ((luminanceForHexColor(hex ?? '') ?? 0) >= midpoint) {
    return ColorPalette.grayscale.darkGrey
  }
  return ColorPalette.grayscale.white
}

export const toImageSource = (source: unknown): ImageSourcePropType => {
  if (typeof source === 'string') {
    return { uri: source as string }
  }
  return source as ImageSourcePropType
}

export const getCredentialIdentifiers = (credential: DidCommCredentialExchangeRecord) => {
  return {
    credentialDefinitionId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId,
    schemaId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.schemaId,
  }
}

/**
 * Attempts to resolve schema and credDef IDs from credential format data.
 */
async function resolveIdsFromFormatData(
  credential: DidCommCredentialExchangeRecord,
  agent: Agent,
  logger?: BifoldLogger
): Promise<{ schemaId?: string; credDefId?: string }> {
  try {
    const { offer } = await agent.didcomm.credentials.getFormatData(credential.id)
    const formatOfferData = offer?.anoncreds ?? offer?.indy

    // Type guard to check if formatOfferData has the expected structure
    if (
      formatOfferData &&
      typeof formatOfferData === 'object' &&
      'schema_id' in formatOfferData &&
      typeof formatOfferData.schema_id === 'string'
    ) {
      return {
        schemaId: formatOfferData.schema_id,
        credDefId:
          'cred_def_id' in formatOfferData && typeof formatOfferData.cred_def_id === 'string'
            ? formatOfferData.cred_def_id
            : undefined,
      }
    }
  } catch (error) {
    logger?.error('Failed to get format data', { error: error as Error })
  }
  return {}
}

/**
 * Resolves schema name from the given schema ID.
 */
async function resolveSchemaName(schemaId: string, agent: Agent, logger?: BifoldLogger): Promise<string | undefined> {
  try {
    const { schema: resolvedSchema } = await agent.modules.anoncreds.getSchema(schemaId)
    const schemaName = resolvedSchema?.name
    logger?.debug('Resolved schema name', { schemaId, schemaName })
    return schemaName
  } catch (error) {
    logger?.warn('Failed to resolve schema', { error: error as Error, schemaId })
    return undefined
  }
}

/**
 * Resolves credential definition tag from the given cred def ID.
 */
async function resolveCredDefTag(credDefId: string, agent: Agent, logger?: BifoldLogger): Promise<string | undefined> {
  try {
    const { credentialDefinition: resolvedCredDef } = await agent.modules.anoncreds.getCredentialDefinition(credDefId)
    const credDefTag = resolvedCredDef?.tag
    logger?.debug('Resolved credential definition tag', { credDefId, credDefTag })
    return credDefTag
  } catch (error) {
    logger?.warn('Failed to resolve credential definition', { error: error as Error, credDefId })
    return undefined
  }
}

/**
 * Determines the IDs to use for resolution, preferring offer data over existing metadata.
 */
async function determineSchemaAndCredDefIds(
  credential: DidCommCredentialExchangeRecord,
  agent: Agent,
  offerData: { schema_id?: string; cred_def_id?: string } | undefined,
  existingMetadata: any,
  logger?: BifoldLogger
): Promise<{ schemaId?: string; credDefId?: string }> {
  let schemaId = offerData?.schema_id || existingMetadata?.schemaId
  let credDefId = offerData?.cred_def_id || existingMetadata?.credentialDefinitionId

  const needsResolution = !schemaId || !credDefId
  if (needsResolution) {
    const resolvedIds = await resolveIdsFromFormatData(credential, agent, logger)
    schemaId = schemaId || resolvedIds.schemaId
    credDefId = credDefId || resolvedIds.credDefId
  }

  return { schemaId, credDefId }
}

/**
 * Updates credential metadata with resolved schema name and cred def tag.
 */
async function updateCredentialMetadata(params: {
  credential: DidCommCredentialExchangeRecord
  agent: Agent
  existingMetadata: any
  schemaId: string | undefined
  credDefId: string | undefined
  schemaName: string | undefined
  credDefTag: string | undefined
  logger?: BifoldLogger
}): Promise<void> {
  const { credential, agent, existingMetadata, schemaId, credDefId, schemaName, credDefTag, logger } = params

  const metadataToStore = {
    ...existingMetadata,
    schemaId,
    credentialDefinitionId: credDefId,
    schemaName,
    credDefTag,
  }

  credential.metadata.add(AnonCredsCredentialMetadataKey, metadataToStore)
  await agent.didcomm.credentials.update(credential)

  logger?.info('Credential metadata ensured', {
    credentialId: credential.id,
    schemaName,
    credDefTag,
    wasUpdated: true,
  })
}

/**
 * Ensures credential has all required metadata cached. If any metadata is missing,
 * it will be resolved and added to the credential.
 *
 * @param credential - The credential record to ensure metadata for
 * @param agent - The agent instance for resolving schema/credDef
 * @param offerData - Optional offer data containing schema_id and cred_def_id
 * @param logger - Optional logger instance for logging
 * @returns Promise<boolean> - Returns true if metadata was updated, false otherwise
 */
export async function ensureCredentialMetadata(
  credential: DidCommCredentialExchangeRecord,
  agent: Agent,
  offerData?: { schema_id?: string; cred_def_id?: string },
  logger?: BifoldLogger
): Promise<boolean> {
  if (!agent?.modules?.anoncreds) {
    return false
  }

  const existingMetadata = credential.metadata.get(AnonCredsCredentialMetadataKey)

  const { schemaId, credDefId } = await determineSchemaAndCredDefIds(
    credential,
    agent,
    offerData,
    existingMetadata,
    logger
  )

  // Check what's missing
  const needsSchemaName = !existingMetadata?.schemaName && schemaId
  const needsCredDefTag = !existingMetadata?.credDefTag && credDefId

  const hasAllMetadata = !needsSchemaName && !needsCredDefTag
  if (hasAllMetadata) {
    return false
  }

  // Resolve missing metadata
  const schemaName =
    needsSchemaName && schemaId ? await resolveSchemaName(schemaId, agent, logger) : existingMetadata?.schemaName

  const credDefTag =
    needsCredDefTag && credDefId ? await resolveCredDefTag(credDefId, agent, logger) : existingMetadata?.credDefTag

  await updateCredentialMetadata({
    credential,
    agent,
    existingMetadata,
    schemaId,
    credDefId,
    schemaName,
    credDefTag,
    logger,
  })

  return true
}

/**
 * Validates whether a credential name is meaningful and should be used for display.
 * Returns false for undefined, empty, whitespace-only, or default placeholder names.
 *
 * @param name - The name to validate
 * @returns true if the name is valid and meaningful, false otherwise
 */
export function isValidCredentialName(name: string | undefined): boolean {
  return !!(name && name !== defaultCredDefTag && name !== fallbackDefaultCredentialNameValue && name.trim() !== '')
}

/**
 * Determines the effective credential name using a priority waterfall:
 * 1. OCA Bundle name (if present and meaningful)
 * 2. Credential definition tag (if present)
 * 3. Schema name (if present)
 * 4. Default fallback name
 *
 * @param credential - The credential record
 * @param ocaName - The name from OCA meta overlay
 * @returns The effective name to use for display
 */
export function getEffectiveCredentialName(credential: DidCommCredentialExchangeRecord, ocaName?: string): string {
  // 1. Try OCA Bundle name
  if (isValidCredentialName(ocaName)) {
    return ocaName!
  }

  // 2. Try credential definition tag
  const credDefTag = getCredDefTag(credential)
  if (isValidCredentialName(credDefTag)) {
    return credDefTag!
  }

  // 3. Try schema name
  const schemaName = getSchemaName(credential)
  if (isValidCredentialName(schemaName)) {
    return schemaName!
  }

  // 4. Return default fallback
  return fallbackDefaultCredentialNameValue
}
