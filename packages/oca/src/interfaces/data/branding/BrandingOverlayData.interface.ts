import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface IBrandingOverlayData extends IBaseOverlayData {
  logo: string
  background_image: string
  background_image_slice: string
  primary_background_color: string
  secondary_background_color: string
  primary_attribute: string
  secondary_attribute: string
  issued_date_attribute: string
  expiry_date_attribute: string
}
