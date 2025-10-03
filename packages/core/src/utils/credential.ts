import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { DidCommCredentialExchangeRecord, DidCommCredentialState } from '@credo-ts/didcomm'
import { ImageSourcePropType } from 'react-native'

import { luminanceForHexColor } from './luminance'

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
