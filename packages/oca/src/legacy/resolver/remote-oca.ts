import axios from 'axios'
import RNFS from 'react-native-fs'

import { IOverlayBundleData } from '../../interfaces'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay, OverlayBundle } from '../../types'
import { generateColor } from '../../utils'

import { BrandingOverlayType, DefaultOCABundleResolver, Identifiers, OCABundle, OCABundleResolverOptions } from './oca'

export interface RemoteOCABundleResolverOptions extends OCABundleResolverOptions {
  indexFileName?: string
  preLoad?: boolean
}

type BundleIndexEntry = {
  path: string
  sha256: string
}

type BundleIndex = {
  [key: string]: BundleIndexEntry
}

export class RemoteOCABundleResolver extends DefaultOCABundleResolver {
  protected indexFile: BundleIndex = {}
  private axiosInstance: axios.AxiosInstance
  private indexFileName: string

  constructor(indexFileBaseUrl: string, options?: RemoteOCABundleResolverOptions) {
    super({}, options)

    console.log('****************** 2')
    console.log('****************** 2')
    console.log('****************** 2')
    console.log('****************** 2')
    console.log('****************** 2')
    console.log('****************** 2')
    console.log('****************** 2')

    this.indexFileName = options?.indexFileName || 'ocabundles.json'
    this.axiosInstance = axios.create({
      baseURL: indexFileBaseUrl,
    })
  }

  private findSha256ByPath = (path: string): string | null => {
    for (const key in this.indexFile) {
      if (this.indexFile[key].path === path) {
        return this.indexFile[key].sha256
      }
    }

    return null
  }

  private fileNameForPath = (path: string): string | null => {
    return path === this.indexFileName ? this.indexFileName : this.findSha256ByPath(path)
  }

  private checkFileExists = async (fileName: string): Promise<boolean> => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${fileName}`

    try {
      const fileExists = await RNFS.exists(pathToFile)
      console.log(`File ${fileName} ${fileExists ? 'does ' : 'does not '} exist at ${pathToFile}`)
      return fileExists
    } catch (error) {
      console.error(`Failed to check existence of ${fileName} at ${pathToFile}`)
    }

    return false
  }

  private saveFileToLocalStorage = async (fileName: string, data: string): Promise<boolean> => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${fileName}`

    try {
      await RNFS.writeFile(pathToFile, data, 'utf8')
      console.log(`File ${fileName} saved to ${pathToFile}`)

      return true
    } catch (error) {
      console.error(`Failed to save file ${fileName} to ${pathToFile}, ${error}`)
    }

    return false
  }

  private loadFileFromLocalStorage = async (fileName: string): Promise<string | undefined> => {
    const pathToFile = `${RNFS.DocumentDirectoryPath}/${fileName}`

    try {
      const fileExists = await this.checkFileExists(fileName)
      if (!fileExists) {
        return
      }

      const data = await RNFS.readFile(pathToFile, 'utf8')
      console.log(`File ${fileName} loaded from ${pathToFile}`)

      return data
    } catch (error) {
      console.error(`Failed to load file ${fileName} from ${pathToFile}`)
    }
  }

  private fetchRemoteResource = async (path: string, useCachedOnFail = true): Promise<any> => {
    let response: axios.AxiosResponse<any, any> | undefined = undefined
    try {
      response = await this.axiosInstance.get(path)
    } catch (error) {
      console.error(`Failed to fetch remote resource at ${path}`)
    }

    if ((!response || response.status !== 200) && useCachedOnFail) {
      console.error(`Failed to fetch, loading ${path} from cache`)
      const loadFileName = this.fileNameForPath(path)
      if (loadFileName) {
        const cachedData = await this.loadFileFromLocalStorage(loadFileName)
        if (cachedData) {
          return JSON.parse(cachedData)
        }
      } else {
        console.error(`Failed to determine file name for path ${path} for save`)
      }

      return
    }

    if (response && response.data) {
      const saveFileName = this.fileNameForPath(path)
      if (saveFileName) {
        await this.saveFileToLocalStorage(saveFileName, JSON.stringify(response.data))
      } else {
        console.error(`Failed to determine file name for path ${path} for load`)
      }
    }

    return response.data
  }

  private loadOCAIndex = async (fileName: string) => {
    const data = await this.fetchRemoteResource(fileName)

    this.indexFile = data
  }

  private loadOCABundle = async (fileName: string): Promise<IOverlayBundleData[]> => {
    const data = await this.fetchRemoteResource(fileName)

    return data
  }

  public async resolve(params: {
    identifiers: Identifiers
    language?: string | undefined
  }): Promise<OCABundle | undefined> {
    const { schemaId, credentialDefinitionId, templateId } = params.identifiers
    const language = params.language || 'en'
    let identifier = schemaId || credentialDefinitionId || templateId

    await this.loadOCAIndex(this.indexFileName)

    if (!identifier || !(identifier in this.bundles || identifier in this.indexFile)) {
      return Promise.resolve(undefined)
    }

    if (identifier in this.bundles) {
      return Promise.resolve(
        new OCABundle(this.bundles[identifier] as OverlayBundle, {
          ...this.options,
          language: language ?? this.options.language,
        })
      )
    }

    const bundlePath = this.indexFile[identifier]?.path

    if (!bundlePath) {
      return Promise.resolve(undefined)
    }

    try {
      const bundleData: IOverlayBundleData[] = await this.loadOCABundle(bundlePath)
      const overlayBundle = new OverlayBundle(params.identifiers.credentialDefinitionId ?? '', bundleData[0])
      const overlay = overlayBundle.overlays.find(
        (overlay) => overlay.type === BrandingOverlayType.Branding01 || overlay.type === BrandingOverlayType.Branding10
      )

      if (!overlay) {
        overlayBundle.overlays.push(
          ...this.getFallbackBrandingOverlays(overlayBundle.credentialDefinitionId, overlayBundle.captureBase.digest)
        )
      }

      this.bundles[identifier] = overlayBundle

      return new OCABundle(overlayBundle, {
        ...this.options,
        language: language ?? this.options.language,
      })
    } catch (error) {
      // probably couldn't parse the overlay bundle.
      return Promise.resolve(undefined)
    }
  }

  private getFallbackBrandingOverlays(credentialDefinitionId: string, captureBase: string): BaseOverlay[] {
    const legacyBrandingOverlay: LegacyBrandingOverlay = new LegacyBrandingOverlay(credentialDefinitionId, {
      capture_base: captureBase,
      type: BrandingOverlayType.Branding01,
      background_color: generateColor(credentialDefinitionId),
    })

    const brandingOverlay: BrandingOverlay = new BrandingOverlay(credentialDefinitionId, {
      capture_base: captureBase,
      type: BrandingOverlayType.Branding10,
      primary_background_color: generateColor(credentialDefinitionId),
    })
    return [legacyBrandingOverlay, brandingOverlay]
  }
}
