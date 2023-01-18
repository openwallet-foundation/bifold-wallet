import { CredentialExchangeRecord } from '@aries-framework/core'
import { ImageSourcePropType } from 'react-native'

import { Theme } from '../theme'

type ColorPallet = Theme['ColorPallet']

import { luminanceForHexColor } from './luminance'

export const isValidIndyCredential = (credential: CredentialExchangeRecord) => {
  return credential && credential.credentials.find((c) => c.credentialRecordType === 'indy')
}

export const credentialTextColor = (ColorPallet: ColorPallet, hex?: string) => {
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
