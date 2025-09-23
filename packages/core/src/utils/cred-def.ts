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

// Normalize incoming identifiers by trimming whitespace and converting empty strings to undefined
function normalizeId(id?: string): string | undefined {
  if (typeof id !== 'string') return undefined
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export async function getCredentialName(credDefId?: string, schemaId?: string, agent?: Agent): Promise<string> {
  const normalizedCredDefId = normalizeId(credDefId)
  const normalizedSchemaId = normalizeId(schemaId)
  const isWebvh = !!(
    normalizedCredDefId?.toLowerCase().startsWith('did:webvh:') ||
    normalizedSchemaId?.toLowerCase().startsWith('did:webvh:')
  )
  if (isWebvh) {
    return parseWebVHCredDefId(normalizedCredDefId, normalizedSchemaId, agent)
  }
  return parseIndyCredDefId(normalizedCredDefId, normalizedSchemaId)
}

async function parseWebVHCredDefId(credDefId?: string, schemaId?: string, agent?: Agent): Promise<string> {
  let name = 'Credential'
  if (!agent?.modules?.anoncreds) {
    return name
  }
  if (credDefId) {
    try {
      const result: AnonCredsCredentialDefinition = await agent.modules.anoncreds.getCredentialDefinition(credDefId)
      name = result?.tag ?? name
    } catch {
      agent?.config?.logger?.info('parseWebVHCredDefId: Credential definition not found, using default name')
    }
  }

  if ((name.toLowerCase() === 'default' || name.toLowerCase() === 'credential') && schemaId) {
    try {
      const result: AnonCredsSchema = await agent.modules.anoncreds.getSchema(schemaId)
      name = result?.name ?? name
    } catch {
      agent?.config?.logger?.info('parseWebVHCredDefId: Schema definition not found, using default name')
    }
  }
  return name || 'Credential'
}

function parseIndyCredDefId(credDefId?: string, schemaId?: string): string {
  let name = 'Credential'
  if (credDefId) {
    try {
      const parsedCredDef = parseIndyCredentialDefinitionId(credDefId)
      name = parsedCredDef?.tag ?? name
    } catch {
      // If parsing fails, keep the default name
    }
  }
  if (name.toLowerCase() === 'default' || name.toLowerCase() === 'credential') {
    if (schemaId) {
      try {
        const parsedSchema = parseIndySchemaId(schemaId)
        name = parsedSchema?.schemaName ?? name
      } catch {
        // If parsing fails, keep the default name
        name = 'Credential'
      }
    } else {
      name = 'Credential'
    }
  }
  return name
}

function credentialDefinition(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId
}

export async function parsedCredDefNameFromCredential(credential: CredentialRecord, agent?: Agent): Promise<string> {
  return getCredentialName(credentialDefinition(credential), credentialSchema(credential), agent)
}

export async function parsedCredDefName(
  credentialDefinitionId: string,
  schemaId: string,
  agent?: Agent
): Promise<string> {
  return getCredentialName(credentialDefinitionId, schemaId, agent)
}
