import { OCABundleResolverType, OCABundleResolverOptions, Identifiers, Meta, Bundle } from '../types/oca'
import { Field } from '../types/record'

import { AbstractOCABundleResolver } from './abstract-ocaresolver'
import { OCABundle } from './ocabundle'

export class OCABundleResolver extends AbstractOCABundleResolver implements OCABundleResolverType {
  private bundles: Record<string, Bundle>

  public constructor(bundles: Record<string, Bundle> = {}, options?: OCABundleResolverOptions) {
    super(options)
    this.bundles = bundles
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
    const presentationFields = [...params.attributes]

    if (bundle?.captureBase?.attributes) {
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
