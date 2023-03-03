import { CredentialMetadataKeys, CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { credentialSchema, parseSchemaFromId } from './schema'

export function parseCredDefFromId(credDefId?: string, schemaId?: string): string {
  let name = 'Credential'
  if (credDefId) {
    const credDefRegex = /[^:]+/g
    const credDefIdParts = credDefId.match(credDefRegex)
    if (credDefIdParts?.length === 5) {
      name = `${credDefIdParts?.[4].replace(/_|-/g, ' ')}`
        .split(' ')
        .map((credIdPart) => credIdPart.charAt(0).toUpperCase() + credIdPart.substring(1))
        .join(' ')
    }
  }
  if (name.toLocaleLowerCase() === 'default' || name.toLowerCase() === 'credential') {
    name = parseSchemaFromId(schemaId).name
  }
  return name
}

function credentialDefinition(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.credentialDefinitionId
}

export function parsedCredDefName(credential: CredentialRecord): string {
  return parseCredDefFromId(credentialDefinition(credential), credentialSchema(credential))
}
