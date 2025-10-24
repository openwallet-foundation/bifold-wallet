import {
  AnonCredsCredentialMetadataKey,
  parseIndyCredentialDefinitionId,
  parseIndySchemaId,
  AnonCredsCredentialDefinition,
  AnonCredsSchema,
} from '@credo-ts/anoncreds'
import { CredentialExchangeRecord as CredentialRecord } from '@credo-ts/core'
import type { Agent } from '@credo-ts/core'

import { credentialSchema } from './schema'
import { ensureCredentialMetadata, getEffectiveCredentialName } from './credential'
import { BifoldLogger } from '../services/logger'

// Fallback default credential name when no other name is available
export const fallbackDefaultCredentialNameValue = 'Credential'

// Default credential definition tag value
export const defaultCredDefTag = 'default'

// Normalize incoming identifiers by trimming whitespace and converting empty strings to undefined
function normalizeId(id?: string): string | undefined {
  if (typeof id !== 'string') return undefined
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export async function getCredentialName(credDefId?: string, schemaId?: string, agent?: Agent, logger?: BifoldLogger): Promise<string> {
  const normalizedCredDefId = normalizeId(credDefId)
  const normalizedSchemaId = normalizeId(schemaId)
  const isWebvh = !!(
    normalizedCredDefId?.toLowerCase().startsWith('did:webvh:') ||
    normalizedSchemaId?.toLowerCase().startsWith('did:webvh:')
  )
  if (isWebvh) {
    return parseWebVHCredDefId(normalizedCredDefId, normalizedSchemaId, agent, logger)
  }
  return parseIndyCredDefId(normalizedCredDefId, normalizedSchemaId)
}

async function parseWebVHCredDefId(credDefId?: string, schemaId?: string, agent?: Agent, logger?: BifoldLogger): Promise<string> {
  let name = fallbackDefaultCredentialNameValue
  if (!agent?.modules?.anoncreds) {
    return name
  }
  if (credDefId) {
    try {
      const { credentialDefinition: result }: { credentialDefinition: AnonCredsCredentialDefinition } =
        await agent.modules.anoncreds.getCredentialDefinition(credDefId)
      name = result?.tag ?? name
    } catch {
      logger?.info('parseWebVHCredDefId: Credential definition not found, using default name')
    }
  }

  if ((name.toLowerCase() === defaultCredDefTag || name.toLowerCase() === fallbackDefaultCredentialNameValue.toLowerCase()) && schemaId) {
    try {
      const { schema: result }: { schema: AnonCredsSchema } = await agent.modules.anoncreds.getSchema(schemaId)
      name = result?.name ?? name
    } catch {
      logger?.info('parseWebVHCredDefId: Schema definition not found, using default name')
    }
  }
  return name || fallbackDefaultCredentialNameValue
}

function parseIndyCredDefId(credDefId?: string, schemaId?: string): string {
  let name = fallbackDefaultCredentialNameValue
  if (credDefId) {
    try {
      const parsedCredDef = parseIndyCredentialDefinitionId(credDefId)
      name = parsedCredDef?.tag ?? name
    } catch {
      // If parsing fails, keep the default name
    }
  }
  if (name.toLowerCase() === defaultCredDefTag || name.toLowerCase() === fallbackDefaultCredentialNameValue.toLowerCase()) {
    if (schemaId) {
      try {
        const parsedSchema = parseIndySchemaId(schemaId)
        name = parsedSchema?.schemaName ?? name
      } catch {
        // If parsing fails, keep the default name
        name = fallbackDefaultCredentialNameValue
      }
    } else {
      name = fallbackDefaultCredentialNameValue
    }
  }
  return name
}

function credentialDefinition(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId
}

export function getSchemaName(credential: CredentialRecord): string | undefined {
  const metadata = credential.metadata.get(AnonCredsCredentialMetadataKey)
  const schemaName = metadata?.schemaName
  return schemaName
}

export function getCredDefTag(credential: CredentialRecord): string | undefined {
  const metadata = credential.metadata.get(AnonCredsCredentialMetadataKey)
  const credDefTag = metadata?.credDefTag
  return credDefTag
}

export async function parsedCredDefNameFromCredential(credential: CredentialRecord, agent?: Agent, logger?: BifoldLogger): Promise<string> {
  // Ensure metadata is cached if agent is provided
  if (agent) {
    try {
      await ensureCredentialMetadata(credential, agent, undefined, logger)
    } catch (error) {
      // If metadata restoration fails, we'll fall back to parsing IDs or default name
      logger?.warn('Failed to restore credential metadata in parsedCredDefNameFromCredential', { error: error as Error })
    }
  }

  // Check if we have cached metadata
  const cachedSchemaName = getSchemaName(credential)
  
  if (cachedSchemaName) {
    // Use the priority waterfall logic (OCA name > credDefTag > schemaName > fallback)
    return getEffectiveCredentialName(credential)
  }

  // Fallback: parse the IDs if metadata is not cached and no agent to resolve
  const fallbackName = await getCredentialName(credentialDefinition(credential), credentialSchema(credential), agent, logger)
  return fallbackName
}

export async function parsedCredDefName(
  credentialDefinitionId: string,
  schemaId: string,
  agent?: Agent,
  logger?: BifoldLogger
): Promise<string> {
  return getCredentialName(credentialDefinitionId, schemaId, agent, logger)
}
