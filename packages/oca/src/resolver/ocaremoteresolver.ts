import axios from 'axios'

import {
  Bundle,
  Field,
  Identifiers,
  Meta,
  OCABundleResolverType,
  OCABundleType,
  RemoteOCABundleResolverOptions,
} from '../types'

import { AbstractOCABundleResolver } from './abstract-ocaresolver'
import { OCABundle } from './ocabundle'

export class RemoteOCABundleResolver extends AbstractOCABundleResolver implements OCABundleResolverType {
  protected remoteBundlesUrl: string
  private bundles: Record<string, Bundle> = {}
  private remote

  public constructor(remoteBundlesUrl: string, options?: RemoteOCABundleResolverOptions) {
    super(options)
    this.remoteBundlesUrl = remoteBundlesUrl
    this.remote = axios.create({
      baseURL: this.remoteBundlesUrl,
    })
    if (options?.preloadBundles) {
      this.preloadBundles()
    }
  }

  private preloadBundles() {
    this.remote.get('/all.json').then((response) => {
      this.bundles = response.data as Record<string, Bundle>
    })
  }

  public resolveDefaultBundle(params: {
    identifiers: Identifiers
    meeta?: Meta | undefined
    language?: string | undefined
  }): Promise<OCABundleType | undefined> {
    return this.getDefaultBundle(params)
  }

  public resolve(params: {
    identifiers: Identifiers
    language?: string | undefined
  }): Promise<OCABundleType | undefined> {
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
    // no bundle cached. Searching for a remote one
    return new Promise((resolve) => {
      this.remote
        .get(`/${params.identifiers.schemaId}/${params.identifiers.credentialDefinitionId}/bundle.json`)
        .then((response) => {
          const bundle = response.data as unknown as Bundle
          this.bundles[params.identifiers.credentialDefinitionId as string] = bundle
          resolve(new OCABundle(bundle, { ...this.options, language: language ?? this.options.language }))
        })
        .catch(() => {
          this.remote
            .get(`/${params.identifiers.schemaId}/bundle.json`)
            .then((response) => {
              const bundle = response.data as unknown as Bundle
              this.bundles[params.identifiers.schemaId as string] = bundle
              resolve(new OCABundle(bundle, { ...this.options, language: language ?? this.options.language }))
            })
            .catch(() => {
              resolve(undefined)
            })
        })
    })
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
