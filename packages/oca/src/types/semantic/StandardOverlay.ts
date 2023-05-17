import { IStandardOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class StandardOverlay extends BaseOverlay {
  #attr_standards: Record<string, string>

  constructor(overlay: IStandardOverlayData) {
    super(overlay)
    this.#attr_standards = overlay.attr_standards
  }

  get attributeStandards(): Record<string, string> {
    return this.#attr_standards
  }
}
