import {
  CredentialExchangeRecord,
  CredentialPreviewAttribute,
  CredentialPreviewAttributeOptions,
} from '@aries-framework/core'

import { IOverlayBundleAttribute as OverlayBundleAttributeOptions } from '../interfaces/overlay'
import { OverlayBundle } from '../types'

class DisplayAttribute extends CredentialPreviewAttribute {
  format: string | undefined
  information: string | undefined
  label: string | undefined

  constructor(
    options: CredentialPreviewAttributeOptions,
    overlayOptions: OverlayBundleAttributeOptions,
    language: string
  ) {
    if (!language) throw new Error('language is required')
    super(options)

    this.format = overlayOptions.format
    this.information = overlayOptions.information?.[language]
    this.label = overlayOptions.label?.[language]
  }

  toJSON(): Record<string, unknown> {
    return { ...super.toJSON(), format: this.format, information: this.information, label: this.label }
  }
}

export default class CredentialFormatter {
  #attributes!: Record<string, DisplayAttribute[]>

  constructor(bundle: OverlayBundle, record: CredentialExchangeRecord) {
    this.#attributes = bundle.languages.reduce((attributes, language) => {
      attributes[language] =
        record.credentialAttributes?.map((attribute) => {
          const overlayOptions = bundle.getAttribute(attribute.name) ?? { name: attribute.name, type: '' }
          return new DisplayAttribute(attribute, overlayOptions, language)
        }) ?? []
      return attributes
    }, {} as Record<string, DisplayAttribute[]>)
  }

  localizedAttributes(language: string): DisplayAttribute[] {
    return this.#attributes[language] ?? []
  }
}
