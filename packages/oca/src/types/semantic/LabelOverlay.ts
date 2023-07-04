import { ILabelOverlayData } from '../../interfaces/data'
import BaseOverlayL10n from '../base/BaseOverlayL10n'

export default class LabelOverlay extends BaseOverlayL10n {
  #attribute_labels: Record<string, string>
  #attribute_categories: string[]
  #category_labels: Record<string, string>

  constructor(overlay: ILabelOverlayData) {
    super(overlay)
    this.#attribute_labels = overlay.attribute_labels
    this.#attribute_categories = overlay.attribute_categories
    this.#category_labels = overlay.category_labels
  }

  get attributeLabels(): Record<string, string> {
    return this.#attribute_labels
  }

  get attributeCategories(): string[] {
    return this.#attribute_categories
  }

  get categoryLabels(): Record<string, string> {
    return this.#category_labels
  }
}
