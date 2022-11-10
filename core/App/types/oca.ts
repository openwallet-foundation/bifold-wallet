import { CredentialExchangeRecord, CredentialMetadataKeys } from '@aries-framework/core'

import { parsedCredDefName } from '../utils/cred-def'
import { getCredentialConnectionLabel, hashCode, hashToRGBA } from '../utils/helpers'

import { Attribute, Field } from './record'

export enum BaseType {
  BINARY = 'Binary',
  TEXT = 'Text',
  DATETIME = 'DateTime',
  NUMERIC = 'Numeric',
  DATEINT = 'DateInt',
}

export enum OverlayType {
  BASE_10 = 'spec/capture_base/1.0',
  META_10 = 'spec/overlays/meta/1.0',
  LABEL_10 = 'spec/overlays/label/1.0',
  CARD_LAYOUT_10 = 'spec/overlays/card_layout/1.0',
  FORMAT_10 = 'spec/overlays/format/1.0',
  ENCODING_10 = 'spec/overlays/character_encoding/1.0',
}

export interface Bundle {
  capture_base: CaptureBaseOverlay
  overlays: BaseOverlay[]
}

export interface Bundles {
  [key: string]: Bundle | string
}

export interface BaseOverlay {
  type: string
  capture_base: string
}

export interface BaseL10nOverlay extends BaseOverlay {
  language: string
}

export interface AttributeLabels {
  [key: string]: string
}

export interface LabelOverlay extends BaseL10nOverlay {
  attr_labels: AttributeLabels
}

export interface FormatOverlay extends BaseL10nOverlay {
  attr_formats: AttributeLabels
}

export interface CharacterEncodingOverlay extends BaseL10nOverlay {
  attr_character_encoding: AttributeLabels
}

export interface CaptureBaseOverlay extends BaseOverlay {
  type: string
  attributes?: AttributeLabels
}

export interface MetaOverlay extends BaseL10nOverlay {
  name: string
  issuerName?: string
}

export interface CardLayoutOverlay extends BaseOverlay {
  backgroundColor?: string
  imageSource?: string
  header?: OverlayHeader
  footer?: OverlayFooter
}
export interface OverlayHeader {
  color?: string
  backgroundColor?: string
  imageSource?: string
  hideIssuer?: boolean
}

export interface OverlayFooter {
  color?: string
  backgroundColor?: string
}

export interface OCACredentialBundle {
  getCaptureBase(): CaptureBaseOverlay
  getOverlay<F extends BaseOverlay>(type: string, language?: string): F | undefined
  getLabelOverlay(language: string): LabelOverlay | undefined
  getFormatOverlay(): FormatOverlay | undefined
  getCharacterEncodingOverlay(): CharacterEncodingOverlay | undefined
  getCardLayoutOverlay(): CardLayoutOverlay | undefined
  getMetaOverlay(language: string): MetaOverlay | undefined
}
export interface OCABundleResolver {
  getCredentialPresentationFields(credential: CredentialExchangeRecord, language: string): Promise<Field[]>
  loadDefaultBundles(): OCABundleResolver
  loadBundles(bundles: Bundles): OCABundleResolver
  resolve(credential: CredentialExchangeRecord): Promise<OCACredentialBundle | undefined>
  resolveDefaultBundle(credential: CredentialExchangeRecord): Promise<OCACredentialBundle | undefined>
}
export class DefaultOCACredentialBundle implements OCACredentialBundle {
  private bundle: Bundle
  public constructor(bundle: Bundle) {
    this.bundle = bundle
  }
  public getCardLayoutOverlay(): CardLayoutOverlay | undefined {
    const layout = this.getOverlay<CardLayoutOverlay>(OverlayType.CARD_LAYOUT_10)
    return layout
  }
  public getMetaOverlay(language: string): MetaOverlay | undefined {
    return this.getOverlay<MetaOverlay>(OverlayType.META_10, language)
  }
  public getCaptureBase(): CaptureBaseOverlay {
    const overlay = this.getOverlay<CaptureBaseOverlay>(OverlayType.BASE_10)
    if (overlay === undefined) {
      throw new Error('Expected Capture Base to be defined')
    }
    return overlay
  }
  public getLabelOverlay(language: string): LabelOverlay | undefined {
    return this.getOverlay<LabelOverlay>(OverlayType.LABEL_10, language)
  }
  public getFormatOverlay(): FormatOverlay | undefined {
    return this.getOverlay<FormatOverlay>(OverlayType.FORMAT_10)
  }
  public getCharacterEncodingOverlay(): CharacterEncodingOverlay | undefined {
    return this.getOverlay<CharacterEncodingOverlay>(OverlayType.ENCODING_10)
  }
  public getOverlay<F extends BaseOverlay>(type: string, language?: string): F | undefined {
    if (type === OverlayType.BASE_10) {
      return (this.bundle as Bundle).capture_base as unknown as F
    }
    if (language !== undefined) {
      return (this.bundle as Bundle).overlays.find(
        (item) => item.type === type.toString() && (item as BaseL10nOverlay).language === language
      ) as F
    }
    return (this.bundle as Bundle).overlays.find((item) => item.type === type.toString()) as F
  }
}

export class DefaultOCABundleResolver implements OCABundleResolver {
  private bundles: Bundles = {}
  public resolve(credential: CredentialExchangeRecord): Promise<OCACredentialBundle | undefined> {
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
        return Promise.resolve(new DefaultOCACredentialBundle(bundle as Bundle))
      }
    }
    return Promise.resolve(undefined)
  }
  public resolveDefaultBundle(credential: CredentialExchangeRecord): Promise<OCACredentialBundle | undefined> {
    const defaultMetaOverlay: MetaOverlay = {
      capture_base: '',
      type: OverlayType.META_10,
      name: parsedCredDefName(credential),
      language: 'en',
      issuerName: credential?.connectionId ?? '',
    }
    const defaultCardLayoutLayer: CardLayoutOverlay = {
      capture_base: '',
      type: OverlayType.CARD_LAYOUT_10,
      backgroundColor: hashToRGBA(hashCode(defaultMetaOverlay?.name ?? '')),
    }
    const bundle: Bundle = {
      capture_base: { capture_base: '', type: OverlayType.BASE_10 },
      overlays: [defaultMetaOverlay, defaultCardLayoutLayer],
    }
    return Promise.resolve(new DefaultOCACredentialBundle(bundle))
  }
  public loadBundles(bundles: Bundles): OCABundleResolver {
    Object.assign(this.bundles, bundles)
    return this
  }
  public loadDefaultBundles(): OCABundleResolver {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return this.loadBundles(require('../assets/oca-bundles.json'))
  }
  public async getCredentialPresentationFields(
    credential: CredentialExchangeRecord,
    language: string
  ): Promise<Array<Field>> {
    const bundle = await this.resolve(credential)
    const baseOverlay = bundle?.getCaptureBase()
    const labelOverlay = bundle?.getLabelOverlay(language)
    const formatOverlay = bundle?.getFormatOverlay()
    const characterEncodingOverlay = bundle?.getCharacterEncodingOverlay()
    const _fields: Array<Field> = []
    if (baseOverlay && baseOverlay.attributes) {
      for (const key in baseOverlay?.attributes) {
        if (Object.prototype.hasOwnProperty.call(baseOverlay?.attributes, key)) {
          const _sourceField = credential?.credentialAttributes?.find((item) => item.name === key)
          if (_sourceField) {
            const _field: Field = {
              name: _sourceField.name,
              value: _sourceField.value,
              mimeType: _sourceField.mimeType,
            } as Attribute
            if (labelOverlay?.attr_labels[key]) {
              _field.label = labelOverlay?.attr_labels[key]
            }
            _field.format = formatOverlay?.attr_formats[key]
            _field.type = baseOverlay?.attributes[key]
            _field.encoding = characterEncodingOverlay?.attr_character_encoding[key]

            _fields.push(_field)
          }
        }
      }
    } else {
      if (credential.credentialAttributes) {
        for (const _sourceField of credential.credentialAttributes) {
          const _field: Field = {
            name: _sourceField.name,
            value: _sourceField.value,
            mimeType: _sourceField.mimeType,
          } as Attribute
          if (labelOverlay?.attr_labels[_sourceField.name]) {
            _field.label = labelOverlay?.attr_labels[_sourceField.name]
          }
          _field.format = formatOverlay?.attr_formats[_sourceField.name]
          _field.type = baseOverlay?.attributes?.[_sourceField.name]
          _field.encoding = characterEncodingOverlay?.attr_character_encoding[_sourceField.name]

          _fields.push(_field)
        }
      }
    }
    return _fields
  }
}
