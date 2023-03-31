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
  bundle?: OCABundleType
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
  get cardOverlayType(): CardOverlayType

  resolve(params: { identifiers: Identifiers; language?: string }): Promise<OCABundleType | undefined>

  resolveDefaultBundle(params: {
    identifiers: Identifiers
    meeta?: Meta
    language?: string
  }): Promise<OCABundleType | undefined>

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

export interface RemoteOCABundleResolverOptions extends OCABundleResolverOptions {
  preloadBundles?: boolean
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
