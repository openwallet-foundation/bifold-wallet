import { ILabelOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class LabelOverlay extends BaseOverlay {
  #attribute_labels: Record<string, string>
  #attribute_categories?: string[]
  #category_labels?: Record<string, string>

  language: string

  constructor(overlay: ILabelOverlayData) {
    super(overlay)
    this.language = overlay.language
    this.#attribute_labels = overlay.attribute_labels
    this.#attribute_categories = overlay.attribute_categories
    this.#category_labels = overlay.category_labels
  }

  get attributeLabels(): Record<string, string> {
    return this.#attribute_labels
  }

  get attributeCategories(): string[] | undefined {
    return this.#attribute_categories
  }

  get categoryLabels(): Record<string, string> | undefined {
    return this.#category_labels
  }
}
