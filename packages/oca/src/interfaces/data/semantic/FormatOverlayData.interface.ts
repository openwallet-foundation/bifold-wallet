import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface IFormatOverlayData extends IBaseOverlayData {
  attribute_formats: {
    [key: string]: string;
  };
}
