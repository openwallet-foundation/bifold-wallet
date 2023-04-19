import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface ICharacterEncodingOverlayData
  extends IBaseOverlayData {
  default_character_encoding: string;
  attr_character_encoding: {
    [key: string]: string;
  };
}
