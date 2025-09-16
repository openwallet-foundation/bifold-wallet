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

export async function getCredentialName(credDefId?: string, schemaId?: string, agent?: Agent): Promise<string> {
  const isWebvh = !!(credDefId?.startsWith('did:webvh:') || schemaId?.startsWith('did:webvh:'))
  if (isWebvh) {
    return parseWebVHCredDefId(credDefId, schemaId, agent)
  }
  return parseIndyCredDefId(credDefId, schemaId)
}

async function parseWebVHCredDefId(credDefId?: string, schemaId?: string, agent?: Agent): Promise<string> {
  let name = 'Credential'
  if (!agent?.modules?.anoncreds) {
    return name
  }
  if (credDefId) {
    try {
      const result: AnonCredsCredentialDefinition = await agent.modules.anoncreds.getCredentialDefinition(
        agent.context,
        credDefId
      )
      name = result.tag
    } catch {
      agent.config.logger.info('parseWebVHCredDefId: Credential definition not found, using default name')
    }
  }

  if ((name.toLowerCase() === 'default' || name.toLowerCase() === 'credential') && schemaId) {
    try {
      const result: AnonCredsSchema = await agent.modules.anoncreds.getSchema(agent.context, schemaId)
      name = result.name
    } catch {
      agent.config.logger.info('parseWebVHCredDefId: Schema definition not found, using default name')
    }
  }
  return name || 'Credential'
}

function parseIndyCredDefId(credDefId?: string, schemaId?: string): string {
  let name = 'Credential'
  if (credDefId) {
    const parseIndyCredDefId = parseIndyCredentialDefinitionId(credDefId)
    name = parseIndyCredDefId.tag
  }
  if (name.toLowerCase() === 'default' || name.toLowerCase() === 'credential') {
    if (schemaId) {
      const parseIndySchema = parseIndySchemaId(schemaId)
      name = parseIndySchema.schemaName
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
