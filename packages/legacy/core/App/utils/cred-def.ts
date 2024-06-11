import { AnonCredsCredentialMetadataKey, parseIndyCredentialDefinitionId, parseIndySchemaId } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord as CredentialRecord } from '@credo-ts/core'

import { credentialSchema } from './schema'

export function parseCredDefFromId(credDefId?: string, schemaId?: string): string {
  let name = 'Credential'
  if (credDefId) {
    const parseIndyCredDefId = parseIndyCredentialDefinitionId(credDefId)
    name = parseIndyCredDefId.tag
  }
  if (name.toLocaleLowerCase() === 'default' || name.toLowerCase() === 'credential') {
    if (schemaId) {
      const parseIndySchema = parseIndySchemaId(schemaId)
      name = parseIndySchema.schemaName
    }
  }
  return name
}

function credentialDefinition(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId
}

export function parsedCredDefNameFromCredential(credential: CredentialRecord): string {
  return parseCredDefFromId(credentialDefinition(credential), credentialSchema(credential))
}

export function parsedCredDefName(credentialDefinitionId: string, schemaId: string): string {
  return parseCredDefFromId(credentialDefinitionId, schemaId)
}
