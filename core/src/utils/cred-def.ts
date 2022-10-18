import { CredentialMetadataKeys, CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { parsedSchema } from './schema'

function parseCredDefName(credDefId?: string): string {
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
  return name
}

function credentialDefinition(credential: CredentialRecord): string | undefined {
  return credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.credentialDefinitionId
}

export function parsedCredDefName(credential: CredentialRecord): string {
  let credDefName = parseCredDefName(credentialDefinition(credential))
  // if credDef name is `default` or `credential` use schema name instead
  if (credDefName.toLocaleLowerCase() === 'default' || credDefName.toLowerCase() === 'credential') {
    credDefName = parsedSchema(credential).name
  }
  return credDefName
}
