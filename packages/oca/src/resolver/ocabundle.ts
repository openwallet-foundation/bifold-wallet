import {
  OCABundleType,
  Bundle,
  OCABundleResolverOptions,
  CardOverlayType,
  CaptureBaseOverlay,
  OverlayType,
  CharacterEncodingOverlay,
  FormatOverlay,
  LabelOverlay,
  MetaOverlay,
  CardLayoutOverlay10,
  CardLayoutOverlay11,
  BaseOverlay,
  BaseL10nOverlay,
} from '../types'

export class OCABundle implements OCABundleType {
  private bundle: Bundle
  private options: OCABundleResolverOptions

  public constructor(bundle: Bundle, options?: OCABundleResolverOptions) {
    this.bundle = bundle
    this.options = {
      cardOverlayType: options?.cardOverlayType ?? CardOverlayType.CardLayout11,
      language: options?.language ?? 'en',
    }
  }

  public get captureBase(): CaptureBaseOverlay {
    const overlay = this.getOverlay<CaptureBaseOverlay>(OverlayType.Base10)
    if (!overlay) {
      throw new Error('Capture Base must be defined')
    }
    return overlay
  }

  public get characterEncodingOverlay(): CharacterEncodingOverlay | undefined {
    return this.getOverlay<CharacterEncodingOverlay>(OverlayType.CharacterEncoding10)
  }

  public get formatOverlay(): FormatOverlay | undefined {
    return this.getOverlay<FormatOverlay>(OverlayType.Format10)
  }

  public get labelOverlay(): LabelOverlay | undefined {
    return this.getOverlay<LabelOverlay>(OverlayType.Label10, this.options.language)
  }

  public get metaOverlay(): MetaOverlay | undefined {
    return this.getOverlay<MetaOverlay>(OverlayType.Meta10, this.options.language)
  }

  public get cardLayoutOverlay(): CardLayoutOverlay10 | CardLayoutOverlay11 | undefined {
    return this.getOverlay(this.options?.cardOverlayType || CardOverlayType.CardLayout11)
  }

  public buildOverlay(name: string, language: string): MetaOverlay {
    return {
      captureBase: '',
      type: OverlayType.Meta10,
      name,
      language,
    }
  }

  private getOverlay<T extends BaseOverlay>(type: string, language?: string): T | undefined {
    if (type === OverlayType.Base10) {
      return (this.bundle as Bundle).captureBase as unknown as T
    }
    if (language !== undefined) {
      return (this.bundle as Bundle).overlays.find(
        (item) => item.type === type.toString() && (item as BaseL10nOverlay).language === language
      ) as T
    }
    return (this.bundle as Bundle).overlays.find((item) => item.type === type.toString()) as T
  }
}
