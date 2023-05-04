import startCase from 'lodash.startcase'

import { parseCredDefFromId } from '../utils/cred-def'
import { hashCode, hashToRGBA } from '../utils/helpers'

import { Field } from './record'

export enum BaseType {
  Binary = 'Binary',
  Text = 'Text',
  DateTime = 'DateTime',
  Numeric = 'Numeric',
  DateInt = 'DateInt',
}

export enum BaseOverlayType {
  Base10 = 'spec/capture_base/1.0',
  Meta10 = 'spec/overlays/meta/1.0',
  Label10 = 'spec/overlays/label/1.0',
  Format10 = 'spec/overlays/format/1.0',
  CharacterEncoding10 = 'spec/overlays/character_encoding/1.0',
}

export enum CardOverlayType {
  CardLayout10 = 'spec/overlays/card_layout/1.0',
  CardLayout11 = 'spec/overlays/card_layout/1.1',
}

export const OverlayType = { ...BaseOverlayType, ...CardOverlayType }
export type OverlayType = BaseOverlayType | CardOverlayType

export interface Bundle {
  captureBase: CaptureBaseOverlay
  overlays: BaseOverlay[]
}

export type Bundles = Record<string, Bundle>

export interface BaseOverlay {
  type: string
  captureBase: string
}

export interface BaseL10nOverlay extends BaseOverlay {
  language: string
}

export interface CaptureBaseOverlay extends BaseOverlay {
  type: string
  attributes?: Record<string, string>
}

export interface CharacterEncodingOverlay extends BaseOverlay {
  attributeCharacterEncoding: Record<string, string>
}

export interface FormatOverlay extends BaseOverlay {
  attributeFormats: Record<string, string>
}

export interface LabelOverlay extends BaseL10nOverlay {
  attributeLabels: Record<string, string>
}

export interface MetaOverlay extends BaseL10nOverlay {
  name: string
  description?: string
  issuerName?: string
}

export interface CardLayoutOverlay10 extends BaseOverlay {
  backgroundColor?: string
  imageSource?: string
  header?: {
    color?: string
    backgroundColor?: string
    imageSource?: string
    hideIssuer?: boolean
  }
  footer?: {
    color?: string
    backgroundColor?: string
  }
}

export interface CardLayoutOverlay11 extends BaseOverlay {
  logo?: {
    src: string
  }
  backgroundImage?: {
    src: string
  }
  backgroundImageSlice?: {
    src: string
  }
  primaryBackgroundColor?: string
  secondaryBackgroundColor?: string
  primaryAttribute?: {
    name: string
  }
  secondaryAttribute?: {
    name: string
  }
  issuedDateAttribute?: {
    name: string
  }
  expiryDateAttribute?: {
    name: string
  }
}

export interface CredentialOverlay<T> {
  bundle?: OCABundle
  presentationFields?: Field[]
  metaOverlay?: MetaOverlay
  cardLayoutOverlay?: T
}

export interface OCABundleType {
  get captureBase(): CaptureBaseOverlay
  get metaOverlay(): MetaOverlay | undefined
  get labelOverlay(): LabelOverlay | undefined
  get formatOverlay(): FormatOverlay | undefined
  get characterEncodingOverlay(): CharacterEncodingOverlay | undefined
  get cardLayoutOverlay(): CardLayoutOverlay10 | CardLayoutOverlay11 | undefined
}

export interface OCABundleResolverType {
  resolve(params: { identifiers: Identifiers; language?: string }): Promise<OCABundle | undefined>

  resolveDefaultBundle(params: {
    identifiers: Identifiers
    meeta?: Meta
    language?: string
  }): Promise<OCABundle | undefined>

  presentationFields(params: {
    identifiers: Identifiers
    attributes: Array<Field>
    language?: string
  }): Promise<Field[]>

  resolveAllBundles(params: {
    identifiers: Identifiers
    attributes?: Array<Field>
    meta?: Meta
    language?: string
  }): Promise<CredentialOverlay<BaseOverlay>>
}

export interface OCABundleResolverOptions {
  language?: string
  cardOverlayType?: CardOverlayType
}

export interface Identifiers {
  schemaId?: string
  credentialDefinitionId?: string
  templateId?: string
}

export interface Meta {
  alias?: string
  credName?: string
  credConnectionId?: string
}

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
      // we want to return branding even if there isn't a bundle for a given language
      const overlay = (this.bundle as Bundle).overlays.find(
        (item) => item.type === type.toString() && (item as BaseL10nOverlay).language === language
      ) as T | undefined
      if (overlay) {
        return overlay
      }
    }
    return (this.bundle as Bundle).overlays.find((item) => item.type === type.toString()) as T
  }
}

export class OCABundleResolver implements OCABundleResolverType {
  private bundles: Record<string, Bundle>
  private options: OCABundleResolverOptions

  public constructor(bundles: Record<string, Bundle> = {}, options?: OCABundleResolverOptions) {
    this.bundles = bundles
    this.options = {
      cardOverlayType: options?.cardOverlayType ?? CardOverlayType.CardLayout11,
      language: options?.language ?? 'en',
    }
  }

  public get cardOverlayType() {
    return this.options.cardOverlayType ?? CardOverlayType.CardLayout11
  }

  private getDefaultBundle(params: { language?: string; identifiers?: Identifiers; meta?: Meta }) {
    if (!params.language) {
      params.language = 'en'
    }
    const metaOverlay: MetaOverlay = {
      captureBase: '',
      type: OverlayType.Meta10,
      name: startCase(
        params.meta?.credName ??
          parseCredDefFromId(params.identifiers?.credentialDefinitionId, params.identifiers?.schemaId)
      ),
      issuerName: params.meta?.alias || params.meta?.credConnectionId || 'Unknown Contact',
      language: params.language ?? this.options?.language,
    }

    let colorHash = 'default'
    if (metaOverlay?.name) {
      colorHash = metaOverlay.name
    } else if (metaOverlay?.issuerName) {
      colorHash = metaOverlay.issuerName
    }

    const cardLayoutOverlay10: CardLayoutOverlay10 = {
      captureBase: '',
      type: OverlayType.CardLayout10,
      backgroundColor: hashToRGBA(hashCode(colorHash)),
    }

    const cardLayoutOverlay11: CardLayoutOverlay11 = {
      captureBase: '',
      type: OverlayType.CardLayout11,
      primaryBackgroundColor: hashToRGBA(hashCode(colorHash)),
    }

    const bundle: Bundle = {
      captureBase: { captureBase: '', type: OverlayType.Base10 },
      overlays: [
        metaOverlay,
        this.cardOverlayType === CardOverlayType.CardLayout10 ? cardLayoutOverlay10 : cardLayoutOverlay11,
      ],
    }

    return Promise.resolve(
      new OCABundle(bundle, { ...this.options, language: params.language ?? this.options.language })
    )
  }

  public resolveDefaultBundle(params: {
    identifiers: Identifiers
    meta?: Meta
    language?: string
  }): Promise<OCABundle | undefined> {
    return this.getDefaultBundle(params)
  }

  public resolve(params: { identifiers: Identifiers; language?: string }): Promise<OCABundle | undefined> {
    const language = params.language || 'en'
    for (const item of [
      params.identifiers?.credentialDefinitionId,
      params.identifiers?.schemaId,
      params.identifiers?.templateId,
    ]) {
      if (item && this.bundles[item] !== undefined) {
        let bundle = this.bundles[item]
        // if it is a string, it is a reference/alias to another one bundle
        if (typeof bundle === 'string') {
          bundle = this.bundles[bundle]
        }
        return Promise.resolve(new OCABundle(bundle, { ...this.options, language: language ?? this.options.language }))
      }
    }
    return Promise.resolve(undefined)
  }

  public async presentationFields(params: {
    identifiers: Identifiers
    attributes: Array<Field>
    language?: string
  }): Promise<Field[]> {
    const bundle = await this.resolve(params)
    let presentationFields = [...params.attributes]
    if (bundle?.captureBase?.attributes) {
      // if the oca brandaing has the attrbutes set, only display those attributes
      const bundleFields = Object.keys(bundle.captureBase.attributes)
      presentationFields = presentationFields.filter((item) => item.name && bundleFields.includes(item.name))
      for (let i = 0; i < presentationFields.length; i++) {
        const presentationField = presentationFields[i]
        const key = presentationField.name || ''
        if (bundle.captureBase.attributes[key]) {
          presentationField.label = bundle?.labelOverlay?.attributeLabels[key]
          presentationField.format = bundle?.formatOverlay?.attributeFormats[key]
          presentationField.type = bundle?.captureBase?.attributes?.[key]
          presentationField.encoding = bundle?.characterEncodingOverlay?.attributeCharacterEncoding[key]
        }
      }
    }
    return presentationFields
  }

  public async resolveAllBundles(params: {
    identifiers: Identifiers
    attributes?: Array<Field>
    meta?: Meta
    language?: string
  }) {
    const [bundle, defaultBundle] = await Promise.all([this.resolve(params), this.resolveDefaultBundle(params)])

    const fields = params.attributes
      ? await this.presentationFields({
          ...params,
          attributes: params.attributes,
        })
      : []

    const overlayBundle = bundle ?? defaultBundle
    const metaOverlay = overlayBundle?.metaOverlay
    const cardLayoutOverlay = overlayBundle?.cardLayoutOverlay

    return { bundle: overlayBundle, presentationFields: fields, metaOverlay, cardLayoutOverlay }
  }
}
