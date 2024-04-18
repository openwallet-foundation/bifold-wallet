import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialExchangeRecord, CredentialState } from '@credo-ts/core'
import { ImageSourcePropType } from 'react-native'

import { luminanceForHexColor } from './luminance'

export const isValidAnonCredsCredential = (credential: CredentialExchangeRecord) => {
  return (
    credential &&
    (credential.state === CredentialState.OfferReceived ||
      (Boolean(credential.metadata.get(AnonCredsCredentialMetadataKey)) &&
        credential.credentials.find((c) => c.credentialRecordType === 'anoncreds' || c.credentialRecordType === 'w3c')))
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
    credentialDefinitionId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.credentialDefinitionId,
    schemaId: credential.metadata.get(AnonCredsCredentialMetadataKey)?.schemaId,
  }
}
