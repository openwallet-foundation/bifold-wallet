import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface ILegacyBrandingOverlayData extends IBaseOverlayData {
  background_color?: string
  image_source?: string
  header?: {
    color?: string
    background_color?: string
    image_source?: string
    hide_issuer?: boolean
  }
  footer?: {
    color?: string
    background_color?: string
  }
}
