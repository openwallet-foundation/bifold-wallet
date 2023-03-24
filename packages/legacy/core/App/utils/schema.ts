import { CredentialMetadataKeys, CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

export function parseSchemaFromId(schemaId?: string): { name: string; version: string } {
  let name = 'Credential'
  let version = ''
  if (schemaId) {
    const schemaIdRegex = /(.*?):([0-9]):([a-zA-Z .\-_0-9]+):([a-z0-9._-]+)$/
    const schemaIdParts = schemaId.match(schemaIdRegex)
    if (schemaIdParts?.length === 5) {
      name = `${schemaIdParts?.[3].replace(/_|-/g, ' ')}`
        .split(' ')
        .map((schemaIdPart) => schemaIdPart.charAt(0).toUpperCase() + schemaIdPart.substring(1))
        .join(' ')
      version = schemaIdParts?.[4]
    }
  }
  return { name, version }
}

export function credentialSchema(credential: CredentialRecord): string | undefined {
  return credential.metadata?.get(CredentialMetadataKeys.IndyCredential)?.schemaId
}

export function parsedSchema(credential: CredentialRecord): { name: string; version: string } {
  return parseSchemaFromId(credentialSchema(credential))
}
