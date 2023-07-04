import { IInformationOverlayData } from '../../interfaces/data'
import BaseOverlayL10n from '../base/BaseOverlayL10n'

export default class InformationOverlay extends BaseOverlayL10n {
  #attribute_information: Record<string, string>

  constructor(overlay: IInformationOverlayData) {
    super(overlay)
    this.#attribute_information = overlay.attribute_information
  }

  get attributeInformation(): Record<string, string> {
    return this.#attribute_information
  }
}
