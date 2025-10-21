import { AnonCredsCredentialMetadataKey, AnonCredsCredentialOffer } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord, CredentialState } from '@credo-ts/core'
import type { Agent } from '@credo-ts/core'
import { ImageSourcePropType } from 'react-native'

import { luminanceForHexColor } from './luminance'
import { getSchemaName, getCredDefTag, fallbackDefaultCredentialNameValue, defaultCredDefTag } from './cred-def'

export const isValidAnonCredsCredential = (credential: CredentialExchangeRecord) => {
  return (
    credential &&
    (credential.state === CredentialState.OfferReceived ||
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

export const getCredentialIdentifiers = (credential: CredentialExchangeRecord) => {
  return {
    credentialDefinitionId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId,
    schemaId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.schemaId,
  }
}

/**
 * Ensures credential has all required metadata cached. If any metadata is missing,
 * it will be resolved and added to the credential.
 * 
 * @param credential - The credential record to ensure metadata for
 * @param agent - The agent instance for resolving schema/credDef
 * @param offerData - Optional offer data containing schema_id and cred_def_id
 * @returns Promise<boolean> - Returns true if metadata was updated, false otherwise
 */
export async function ensureCredentialMetadata(
  credential: CredentialExchangeRecord,
  agent: Agent,
  offerData?: { schema_id?: string; cred_def_id?: string }
): Promise<boolean> {
  if (!agent?.modules?.anoncreds) {
    return false
  }

  const existingMetadata = credential.metadata.get(AnonCredsCredentialMetadataKey)
  
  // Determine schemaId and credDefId
  let schemaId = offerData?.schema_id || existingMetadata?.schemaId
  let credDefId = offerData?.cred_def_id || existingMetadata?.credentialDefinitionId

  // If we still don't have IDs, try to get them from format data
  if (!schemaId || !credDefId) {
    try {
      const { offer } = await agent.credentials.getFormatData(credential.id)
      const formatOfferData = (offer?.anoncreds ?? offer?.indy) as AnonCredsCredentialOffer | undefined
      if (formatOfferData) {
        schemaId = schemaId || formatOfferData?.schema_id
        credDefId = credDefId || formatOfferData?.cred_def_id
      }
    } catch (error) {
      agent.config.logger?.warn('Failed to get format data', { error: error as Error })
    }
  }

  // Check what's missing
  const needsSchemaName = !existingMetadata?.schemaName && schemaId
  const needsCredDefTag = !existingMetadata?.credDefTag && credDefId

  if (!needsSchemaName && !needsCredDefTag) {
    // All metadata already present
    return false
  }

  // Resolve missing metadata
  let schemaName = existingMetadata?.schemaName
  let credDefTag = existingMetadata?.credDefTag

  if (needsSchemaName && schemaId) {
    try {
      const { schema: resolvedSchema } = await agent.modules.anoncreds.getSchema(schemaId)
      schemaName = resolvedSchema?.name
      agent.config.logger?.debug('Resolved schema name', { schemaId, schemaName })
    } catch (error) {
      agent.config.logger?.warn('Failed to resolve schema', { error: error as Error, schemaId })
    }
  }

  if (needsCredDefTag && credDefId) {
    try {
      const { credentialDefinition: resolvedCredDef } = await agent.modules.anoncreds.getCredentialDefinition(credDefId)
      credDefTag = resolvedCredDef?.tag
      agent.config.logger?.debug('Resolved credential definition tag', { credDefId, credDefTag })
    } catch (error) {
      agent.config.logger?.warn('Failed to resolve credential definition', { error: error as Error, credDefId })
    }
  }

  // Update metadata if we resolved anything new
  if (needsSchemaName || needsCredDefTag) {
    const metadataToStore = {
      ...existingMetadata,
      schemaId,
      credentialDefinitionId: credDefId,
      schemaName,
      credDefTag,
    }

    credential.metadata.add(AnonCredsCredentialMetadataKey, metadataToStore)
    await agent.credentials.update(credential)

    agent.config.logger?.info('Credential metadata ensured', {
      credentialId: credential.id,
      schemaName,
      credDefTag,
      wasUpdated: true,
    })

    return true
  }

  return false
}

/**
 * Validates whether a credential name is meaningful and should be used for display.
 * Returns false for undefined, empty, whitespace-only, or default placeholder names.
 * 
 * @param name - The name to validate
 * @returns true if the name is valid and meaningful, false otherwise
 */
export function isValidCredentialName(name: string | undefined): boolean {
  return !!(
    name &&
    name !== defaultCredDefTag &&
    name !== fallbackDefaultCredentialNameValue &&
    name.trim() !== ''
  )
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
export function getEffectiveCredentialName(credential: CredentialExchangeRecord, ocaName?: string): string {
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
