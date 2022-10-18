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
}

export interface OverlayFooter {
  color?: string
  backgroundColor?: string
}
