import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface IFormatOverlayData extends IBaseOverlayData {
  attribute_formats: Record<string, string>
}
