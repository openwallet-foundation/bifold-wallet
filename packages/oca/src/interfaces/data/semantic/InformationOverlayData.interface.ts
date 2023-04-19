import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface IInformationOverlayData extends IBaseOverlayData {
  language: string;
  attribute_information: {
    [key: string]: string;
  };
}
