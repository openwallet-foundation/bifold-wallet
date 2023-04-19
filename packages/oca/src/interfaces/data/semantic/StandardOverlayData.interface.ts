import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface IStandardOverlayData extends IBaseOverlayData {
  attr_standards: {
    [key: string]: string;
  };
}
