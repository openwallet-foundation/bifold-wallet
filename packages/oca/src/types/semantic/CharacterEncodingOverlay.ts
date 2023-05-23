import { ICharacterEncodingOverlayData } from '../../interfaces/data'
import BaseOverlay from '../base/BaseOverlay'

export default class CharacterEncodingOverlay extends BaseOverlay {
  #default_character_encoding: string
  // DEPRECATED - Use #attribute_character_encoding instead
  #attr_character_encoding: Record<string, string>
  #attribute_character_encoding: Record<string, string>

  constructor(overlay: ICharacterEncodingOverlayData) {
    super(overlay)
    this.#default_character_encoding = overlay.default_character_encoding
    // DEPRECATED - Use #attribute_character_encoding instead
    this.#attr_character_encoding = overlay.attr_character_encoding
    this.#attribute_character_encoding = overlay.attribute_character_encoding
  }

  get defaultCharacterEncoding(): string {
    return this.#default_character_encoding
  }

  // DEPRECATED - Use attributeCharacterEncoding instead
  get attrCharacterEncoding(): Record<string, string> {
    return this.#attr_character_encoding
  }

  get attributeCharacterEncoding(): Record<string, string> {
    return this.#attribute_character_encoding
  }
}
