import {
  BaseOverlay,
  BrandingOverlay,
  CharacterEncodingOverlay,
  LabelOverlay,
  InformationOverlay,
  FormatOverlay,
  StandardOverlay,
  MetaOverlay,
} from ".";

const OverlayTypeMap: Map<string, typeof BaseOverlay | typeof BrandingOverlay> =
  new Map(
    Object.entries({
      "spec/overlays/character_encoding/1.0": CharacterEncodingOverlay,
      "spec/overlays/label/1.0": LabelOverlay,
      "spec/overlays/information/1.0": InformationOverlay,
      "spec/overlays/format/1.0": FormatOverlay,
      "spec/overlays/standard/1.0": StandardOverlay,
      "spec/overlays/meta/1.0": MetaOverlay,
      "aries/overlays/branding/1.0": BrandingOverlay,
    })
  );

export default OverlayTypeMap;
