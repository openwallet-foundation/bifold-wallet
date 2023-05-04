import { CredentialExchangeRecord, CredentialMetadataKeys, CredentialState } from '@aries-framework/core'
import { ImageSourcePropType } from 'react-native'

import { luminanceForHexColor } from './luminance'

export const isValidIndyCredential = (credential: CredentialExchangeRecord) => {
  return (
    credential &&
    (credential.state === CredentialState.OfferReceived ||
      credential.credentials.find((c) => c.credentialRecordType === 'indy'))
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const credentialTextColor = (ColorPallet: any, hex?: string) => {
  const midpoint = 255 / 2
  if ((luminanceForHexColor(hex ?? '') ?? 0) >= midpoint) {
    return ColorPallet.grayscale.darkGrey
  }
  return ColorPallet.grayscale.white
}

export const toImageSource = (source: unknown): ImageSourcePropType => {
  if (typeof source === 'string') {
    return { uri: source as string }
  }
  return source as ImageSourcePropType
}

export const getCredentialIdentifiers = (credential: CredentialExchangeRecord) => {
  return {
    credentialDefinitionId: credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.credentialDefinitionId,
    schemaId: credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.schemaId,
  }
}
