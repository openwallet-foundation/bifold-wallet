import { ImageSourcePropType } from 'react-native'

export interface Overlay {
  backgroundColor?: string
  imageSource?: ImageSourcePropType
  header?: OverlayHeader
  footer?: OverlayFooter
}
export interface OverlayHeader {
  color?: string
  backgroundColor?: string
  imageSource?: ImageSourcePropType
  hideIssuer?: boolean
  mapping?: OverlayHeaderMapping
}

export interface OverlayFooter {
  color?: string
  backgroundColor?: string
}

export interface OverlayHeaderMapping {
  connectionLabel?: string
  credentialLabel?: string
}
