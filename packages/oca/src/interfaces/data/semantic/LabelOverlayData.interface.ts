import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface ILabelOverlayData extends IBaseOverlayData {
  language: string;
  attribute_labels: {
    [key: string]: string;
  };
  attribute_categories: string[];
  category_labels: {
    [key: string]: string;
  };
}
