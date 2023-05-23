import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface IInformationOverlayData extends IBaseOverlayData {
  language: string
  attribute_information: Record<string, string>
}
