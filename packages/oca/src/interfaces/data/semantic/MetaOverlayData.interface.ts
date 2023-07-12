import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface IMetaOverlayData extends IBaseOverlayData {
  language: string
  name: string
  description: string
  credential_help_text: string
  credential_support_url: string
  issuer: string
  issuer_description: string
  issuer_url: string
  watermark?: string
}
