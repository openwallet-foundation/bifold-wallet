import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface ILabelOverlayData extends IBaseOverlayData {
  language: string
  attribute_labels: Record<string, string>
  attribute_categories: string[]
  category_labels: Record<string, string>
}
