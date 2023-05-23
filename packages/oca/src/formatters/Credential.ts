import {
  CredentialExchangeRecord,
  CredentialPreviewAttribute,
  CredentialPreviewAttributeOptions,
} from '@aries-framework/core'

import { IOverlayBundleAttribute as OverlayBundleAttributeOptions } from '../interfaces/overlay'
import { OverlayBundle } from '../types'

export class LocalizedCredential {
  #bundle!: OverlayBundle

  issuer: string
  name: string
  attributes!: DisplayAttribute[]

  constructor(bundle: OverlayBundle, record: CredentialExchangeRecord, language: string) {
    if (!language) {
      throw new Error('language is required')
    }

    this.#bundle = bundle

    this.issuer = bundle.metadata.issuer?.[language]
    this.name = bundle.metadata.name?.[language]

    // If no record attributes are present then grab default attributes from the bundle
    const credentialAttributes = record.credentialAttributes?.length
      ? record.credentialAttributes
      : bundle.attributes.map((attribute) => {
          return new CredentialPreviewAttribute({ ...attribute, value: '' })
        })

    this.attributes =
      credentialAttributes
        ?.filter((attribute) => bundle.getFlaggedAttribute(attribute.name))
        .map((attribute) => {
          const overlayOptions = bundle.getAttribute(attribute.name) ?? { name: attribute.name, type: '' }
          return new DisplayAttribute(attribute, overlayOptions, language)
        }) ?? []
  }

  get primaryAttribute(): DisplayAttribute | undefined {
    const name = this.#bundle.branding?.primaryAttribute
    return this.getAttribute(name)
  }

  get secondaryAttribute(): DisplayAttribute | undefined {
    const name = this.#bundle.branding?.secondaryAttribute
    return this.getAttribute(name)
  }

  getAttribute(attributeName?: string): DisplayAttribute | undefined {
    if (!attributeName) {
      return undefined
    }
    return this.attributes.find((attribute) => attribute.name === attributeName)
  }
}

export class DisplayAttribute extends CredentialPreviewAttribute {
  characterEncoding: string | undefined
  standard: string | undefined
  format: string | undefined
  information: string | undefined
  label: string | undefined

  constructor(
    options: CredentialPreviewAttributeOptions,
    overlayOptions: OverlayBundleAttributeOptions,
    language: string
  ) {
    super(options)

    this.characterEncoding = overlayOptions.characterEncoding
    this.standard = overlayOptions.standard
    this.format = overlayOptions.format
    this.information = overlayOptions.information?.[language]
    this.label = overlayOptions.label?.[language]
  }

  toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), format: this.format, information: this.information, label: this.label }
  }
}

export class CredentialFormatter {
  #credentials!: Record<string, LocalizedCredential>

  constructor(bundle: OverlayBundle, record: CredentialExchangeRecord) {
    this.#credentials = bundle.languages.reduce((credentials, language) => {
      credentials[language] = new LocalizedCredential(bundle, record, language)
      return credentials
    }, {} as Record<string, LocalizedCredential>)
  }

  localizedCredential(language: string): LocalizedCredential | undefined {
    return this.#credentials[language]
  }
}
