import { IFormatOverlayData } from "@interfaces/data";
import { BaseOverlay } from "..";

export default class FormatOverlay extends BaseOverlay {
  #attribute_formats: {
    [key: string]: string;
  };

  constructor(overlay: IFormatOverlayData) {
    super(overlay);
    this.#attribute_formats = overlay.attribute_formats;
  }

  get attributeFormats(): { [key: string]: string } {
    return this.#attribute_formats;
  }
}
