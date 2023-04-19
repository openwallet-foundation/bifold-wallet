import { ICharacterEncodingOverlayData } from "@interfaces/data";
import { BaseOverlay } from "..";

export default class CharacterEncodingOverlay extends BaseOverlay {
  #default_character_encoding: string;
  #attr_character_encoding: {
    [key: string]: string;
  };

  constructor(overlay: ICharacterEncodingOverlayData) {
    super(overlay);
    this.#default_character_encoding = overlay.default_character_encoding;
    this.#attr_character_encoding = overlay.attr_character_encoding;
  }

  get defaultCharacterEncoding(): string {
    return this.#default_character_encoding;
  }

  get attributeCharacterEncoding(): { [key: string]: string } {
    return this.#attr_character_encoding;
  }
}
