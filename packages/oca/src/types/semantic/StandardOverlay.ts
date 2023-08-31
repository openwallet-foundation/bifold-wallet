import { IStandardOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class StandardOverlay extends BaseOverlay {
  // DEPRECATED - Use #attribute_standards instead
  #attr_standards?: Record<string, string>
  #attribute_standards: Record<string, string>

  constructor(overlay: IStandardOverlayData) {
    super(overlay)
    // DEPRECATED - Use #attribute_standards instead
    this.#attr_standards = overlay.attr_standards
    this.#attribute_standards = overlay.attribute_standards
  }

  // DEPRECATED - Use attributeStandards instead
  get attrStandards(): Record<string, string> | undefined {
    return this.#attr_standards
  }

  get attributeStandards(): Record<string, string> {
    return this.#attribute_standards
  }
}
