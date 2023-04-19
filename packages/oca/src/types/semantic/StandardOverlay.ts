import { IStandardOverlayData } from "@interfaces/data";
import { BaseOverlay } from "..";

export default class StandardOverlay extends BaseOverlay {
  #attr_standards: {
    [key: string]: string;
  };

  constructor(overlay: IStandardOverlayData) {
    super(overlay);
    this.#attr_standards = overlay.attr_standards;
  }

  get attributeStandards(): { [key: string]: string } {
    return this.#attr_standards;
  }
}
