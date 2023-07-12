import { IInformationOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class InformationOverlay extends BaseOverlay {
  #attribute_information: Record<string, string>

  language: string

  constructor(overlay: IInformationOverlayData) {
    super(overlay)
    this.language = overlay.language
    this.#attribute_information = overlay.attribute_information
  }

  get attributeInformation(): Record<string, string> {
    return this.#attribute_information
  }
}
