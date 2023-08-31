import { IFormatOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class FormatOverlay extends BaseOverlay {
  #attribute_formats: Record<string, string>

  constructor(overlay: IFormatOverlayData) {
    super(overlay)
    this.#attribute_formats = overlay.attribute_formats
  }

  get attributeFormats(): Record<string, string> {
    return this.#attribute_formats
  }
}
