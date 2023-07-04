import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface ILegacyBrandingOverlayData extends IBaseOverlayData {
  backgroundColor?: string
  imageSource?: string
  header?: {
    color?: string
    backgroundColor?: string
    imageSource?: string
    hideIssuer?: boolean
  }
  footer?: {
    color?: string
    backgroundColor?: string
  }
}
