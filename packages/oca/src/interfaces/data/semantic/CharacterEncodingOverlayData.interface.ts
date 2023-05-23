import IBaseOverlayData from '../base/BaseOverlayData.interface'

export default interface ICharacterEncodingOverlayData extends IBaseOverlayData {
  default_character_encoding: string
  // DEPRECATED - Use attribute_character_encoding instead
  attr_character_encoding: Record<string, string>
  attribute_character_encoding: Record<string, string>
}
