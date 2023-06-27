import { CredentialExchangeRecord, CredentialPreviewAttribute } from '@aries-framework/core'

import { OverlayBundle } from '../../types'

import DisplayAttribute from './DisplayAttribute'

export default class LocalizedCredential {
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
