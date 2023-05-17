import { IBrandingOverlayData, IOverlayBundleData } from '../../interfaces/data'
import { IOverlayBundleAttribute, IOverlayBundleMetadata } from '../../interfaces/overlay'
import OverlayTypeMap from '../OverlayTypeMap'
import BaseOverlay from '../base/BaseOverlay'
import BrandingOverlay from '../branding/BrandingOverlay'
import CaptureBase from '../capture-base/CaptureBase'
import FormatOverlay from '../semantic/FormatOverlay'
import InformationOverlay from '../semantic/InformationOverlay'
import LabelOverlay from '../semantic/LabelOverlay'
import MetaOverlay from '../semantic/MetaOverlay'

class OverlayBundle {
  credentialDefinitionId!: string
  captureBase!: CaptureBase
  overlays!: BaseOverlay[]
  languages!: string[]
  metadata!: IOverlayBundleMetadata
  attributes!: IOverlayBundleAttribute[]

  constructor(credentialDefinitionId: string, bundle: IOverlayBundleData) {
    this.credentialDefinitionId = credentialDefinitionId
    this.captureBase = new CaptureBase(bundle.capture_base)
    this.overlays = bundle.overlays
      .filter((overlay) => overlay.type !== 'aries/overlays/branding/1.0')
      .map((overlay) => {
        const OverlayClass = (OverlayTypeMap.get(overlay.type) || BaseOverlay) as typeof BaseOverlay
        return new OverlayClass(overlay)
      })
    this.overlays.push(
      ...bundle.overlays
        .filter((overlay) => overlay.type === 'aries/overlays/branding/1.0')
        .map((overlay) => {
          const OverlayClass = (OverlayTypeMap.get(overlay.type) || BrandingOverlay) as typeof BrandingOverlay
          return new OverlayClass(credentialDefinitionId, overlay as IBrandingOverlayData)
        })
    )
    this.languages = this.#processLanguages()
    this.metadata = this.#processMetadata()
    this.attributes = this.#processOverlayAttributes()
  }

  get branding(): BrandingOverlay | undefined {
    return this.#overlaysForType<BrandingOverlay>('aries/overlays/branding/1.0')[0]
  }

  getAttribute(attributeName: string): IOverlayBundleAttribute | undefined {
    return this.attributes.find((attribute) => attribute.name === attributeName)
  }

  #processMetadata(): IOverlayBundleMetadata {
    const metadata: IOverlayBundleMetadata & {
      credentialHelpText: Record<string, string>
      credentialSupportUrl: Record<string, string>
      issuer: Record<string, string>
      issuerDescription: Record<string, string>
      issuerUrl: Record<string, string>
    } = {
      name: {},
      description: {},
      credentialHelpText: {},
      credentialSupportUrl: {},
      issuer: {},
      issuerDescription: {},
      issuerUrl: {},
    }
    for (const overlay of this.#overlaysForType<MetaOverlay>('spec/overlays/meta/1.0')) {
      const language = overlay.language ?? 'en'
      const { name, description, credentialHelpText, credentialSupportUrl, issuer, issuerDescription, issuerUrl } =
        overlay

      if (name) {
        metadata.name[language] = name
      }
      if (description) {
        metadata.description[language] = description
      }
      if (credentialHelpText) {
        metadata.credentialHelpText[language] = credentialHelpText
      }
      if (credentialSupportUrl) {
        metadata.credentialSupportUrl[language] = credentialSupportUrl
      }
      if (issuer) {
        metadata.issuer[language] = issuer
      }
      if (issuerDescription) {
        metadata.issuerDescription[language] = issuerDescription
      }
      if (issuerUrl) {
        metadata.issuerUrl[language] = issuerUrl
      }
    }
    return metadata
  }

  #processLanguages(): string[] {
    const languages: string[] = []
    for (const overlay of this.#overlaysForType<MetaOverlay>('spec/overlays/meta/1.0')) {
      const language = overlay.language
      if (language && !languages.includes(language)) {
        languages.push(language)
      }
    }
    languages.sort((a, b) => a.localeCompare(b))
    return languages
  }

  #processOverlayAttributes(): IOverlayBundleAttribute[] {
    const attributes: IOverlayBundleAttribute[] = []
    const attributeMap = new Map(Object.entries(this.captureBase.attributes))
    for (const [name, type] of attributeMap) {
      attributes.push({
        name,
        type,
        information: this.#processInformationForAttribute(name),
        label: this.#processLabelForAttribute(name),
        format: this.#processFormatForAttribute(name),
      })
    }
    return attributes
  }

  #processInformationForAttribute(key: string): Record<string, string> {
    const information: Record<string, string> = {}
    for (const overlay of this.#overlaysForType<InformationOverlay>('spec/overlays/information/1.0')) {
      if (overlay.attributeInformation?.[key]) {
        const language = overlay.language ?? 'en'
        information[language] = overlay.attributeInformation[key]
      }
    }
    return information
  }

  #processLabelForAttribute(key: string): Record<string, string> {
    const label: Record<string, string> = {}
    for (const overlay of this.#overlaysForType<LabelOverlay>('spec/overlays/label/1.0')) {
      if (overlay.attributeLabels?.[key]) {
        const language = overlay.language ?? 'en'
        label[language] = overlay.attributeLabels[key]
      }
    }
    return label
  }

  #processFormatForAttribute(key: string): string | undefined {
    for (const overlay of this.#overlaysForType<FormatOverlay>('spec/overlays/format/1.0')) {
      if (overlay.attributeFormats?.[key]) {
        return overlay.attributeFormats[key]
      }
    }
    return
  }

  #overlaysForType<T>(type: string): T[] {
    return this.overlays.filter((overlay) => overlay.type === type) as T[]
  }
}

export default OverlayBundle
