import { CredentialExchangeRecord, CredentialMetadataKeys } from '@aries-framework/core'

import { parsedCredDefName } from '../utils/cred-def'
import { hashCode, hashToRGBA } from '../utils/helpers'

import { Attribute, Field } from './record'

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
  resolve(credential: CredentialExchangeRecord, language: string): Promise<OCABundle | undefined>
  resolveDefaultBundle(credential: CredentialExchangeRecord, language: string): Promise<OCABundle | undefined>
  presentationFields(credential: CredentialExchangeRecord, language: string): Promise<Field[]>
}

export interface OCABundleResolverOptions {
  language?: string
  cardOverlayType?: CardOverlayType
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

  public resolveDefaultBundle(credential: CredentialExchangeRecord, language = 'en'): Promise<OCABundle | undefined> {
    const metaOverlay: MetaOverlay = {
      captureBase: '',
      type: OverlayType.Meta10,
      name: parsedCredDefName(credential),
      issuerName: credential?.connectionId ?? '',
      language: language ?? this.options?.language,
    }

    const cardLayoutOverlay10: CardLayoutOverlay10 = {
      captureBase: '',
      type: OverlayType.CardLayout10,
      backgroundColor: hashToRGBA(hashCode(metaOverlay?.name ?? '')),
    }

    const cardLayoutOverlay11: CardLayoutOverlay11 = {
      captureBase: '',
      type: OverlayType.CardLayout11,
      primaryBackgroundColor: hashToRGBA(hashCode(metaOverlay?.name ?? '')),
    }

    const bundle: Bundle = {
      captureBase: { captureBase: '', type: OverlayType.Base10 },
      overlays: [
        metaOverlay,
        this.cardOverlayType === CardOverlayType.CardLayout10 ? cardLayoutOverlay10 : cardLayoutOverlay11,
      ],
    }

    return Promise.resolve(new OCABundle(bundle, { ...this.options, language: language ?? this.options.language }))
  }

  public resolve(credential: CredentialExchangeRecord, language = 'en'): Promise<OCABundle | undefined> {
    const credentialDefinitionId = credential.metadata.get(
      CredentialMetadataKeys.IndyCredential
    )?.credentialDefinitionId
    const schemaId = credential.metadata.get(CredentialMetadataKeys.IndyCredential)?.schemaId

    for (const item of [credentialDefinitionId, schemaId]) {
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

  public async presentationFields(credential: CredentialExchangeRecord, language = 'en'): Promise<Field[]> {
    const bundle = await this.resolve(credential, language ?? this.options.language)
    const fields: Field[] = []

    if (bundle?.captureBase?.attributes) {
      for (const key in bundle?.captureBase?.attributes) {
        if (bundle?.captureBase?.attributes[key]) {
          const sourceAttribute = credential?.credentialAttributes?.find((item) => item.name === key)
          if (sourceAttribute) {
            const field: Field = this.processField(sourceAttribute, key, bundle)
            fields.push(field)
          }
        }
      }
    } else if (credential.credentialAttributes) {
      for (const sourceAttribute of credential.credentialAttributes) {
        const field: Field = this.processField(sourceAttribute, sourceAttribute.name, bundle)
        fields.push(field)
      }
    }

    return fields
  }

  private processField(source: Attribute, key: string, bundle?: OCABundle) {
    const { name, value, mimeType } = source
    const field: Attribute | Field = {
      name,
      value,
      mimeType,
      label: bundle?.labelOverlay?.attributeLabels[key],
      format: bundle?.formatOverlay?.attributeFormats[key],
      type: bundle?.captureBase?.attributes?.[key],
      encoding: bundle?.characterEncodingOverlay?.attributeCharacterEncoding[key],
    }
    return field
  }
}
