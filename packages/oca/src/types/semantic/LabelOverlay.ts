import { ILabelOverlayData } from "@interfaces/data";
import { BaseOverlay } from "..";

export default class LabelOverlay extends BaseOverlay {
  #attribute_labels: {
    [key: string]: string;
  };
  #attribute_categories: string[];
  #category_labels: {
    [key: string]: string;
  };

  language: string;

  constructor(overlay: ILabelOverlayData) {
    super(overlay);
    this.language = overlay.language;
    this.#attribute_labels = overlay.attribute_labels;
    this.#attribute_categories = overlay.attribute_categories;
    this.#category_labels = overlay.category_labels;
  }

  get attributeLabels(): { [key: string]: string } {
    return this.#attribute_labels;
  }

  get attributeCategories(): string[] {
    return this.#attribute_categories;
  }

  get categoryLabels(): { [key: string]: string } {
    return this.#category_labels;
  }
}
