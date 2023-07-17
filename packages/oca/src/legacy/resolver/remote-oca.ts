import axios from 'axios'

import { IOverlayBundleData } from '../../interfaces'
import { OverlayBundle } from '../../types'

import { DefaultOCABundleResolver, Identifiers, OCABundle, OCABundleResolverOptions } from './oca'

export interface RemoteOCABundleResolverOptions extends OCABundleResolverOptions {
  indexFileName?: string
  preLoad?: boolean
}

interface BundlePath {
  path: string
}

export class RemoteOCABundleResolver extends DefaultOCABundleResolver {
  protected indexFile: Record<string, BundlePath> = {}
  private remoteServer

  constructor(indexFileBaseUrl: string, options?: RemoteOCABundleResolverOptions) {
    super({}, options)
    this.remoteServer = axios.create({
      baseURL: indexFileBaseUrl,
    })
    this.remoteServer.get(options?.indexFileName ?? 'ocabundles.json').then((response) => {
      this.indexFile = response.data
    })
  }

  public resolve(params: { identifiers: Identifiers; language?: string | undefined }): Promise<OCABundle | undefined> {
    const language = params.language || 'en'
    let identifier = ''
    if (this.indexFile[params.identifiers.schemaId ?? '']) {
      identifier = params.identifiers.schemaId ?? ''
    } else if (this.indexFile[params.identifiers.credentialDefinitionId ?? '']) {
      identifier = params.identifiers.credentialDefinitionId ?? ''
    } else {
      identifier = params.identifiers.templateId ?? ''
    }

    if (this.bundles[identifier]) {
      return Promise.resolve(
        new OCABundle(this.bundles[identifier] as OverlayBundle, {
          ...this.options,
          language: language ?? this.options.language,
        })
      )
    }

    let bundlePath = ''
    if (this.indexFile[params.identifiers.schemaId ?? '']) {
      identifier = params.identifiers.schemaId ?? ''
      bundlePath = this.indexFile[identifier].path
    } else if (this.indexFile[params.identifiers.credentialDefinitionId ?? '']) {
      identifier = params.identifiers.credentialDefinitionId ?? ''
      bundlePath = this.indexFile[identifier].path
    }
    if (bundlePath !== '') {
      return this.remoteServer.get(bundlePath).then((response) => {
        try {
          const bundleData: IOverlayBundleData[] = response.data
          const overlayBundle = new OverlayBundle(params.identifiers.credentialDefinitionId ?? '', bundleData[0])
          this.bundles[identifier] = overlayBundle
          return new OCABundle(overlayBundle, {
            ...this.options,
            language: language ?? this.options.language,
          })
        } catch (error) {
          // probably couldnt parse the overlay bundle.
          return undefined
        }
      })
    }

    return Promise.resolve(undefined)
  }
}
