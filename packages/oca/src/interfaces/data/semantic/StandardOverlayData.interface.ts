import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface IStandardOverlayData extends IBaseOverlayData {
  // DEPRECATED - Use attribute_standards instead
  attr_standards: Record<string, string>
  attribute_standards: Record<string, string>
}
