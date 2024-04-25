import axios from 'axios'
import { DocumentDirectoryPath, readFile, writeFile, exists } from 'react-native-fs'

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

    this.indexFileName = options?.indexFileName || 'ocabundles.json'
    this.axiosInstance = axios.create({
      baseURL: indexFileBaseUrl,
    })
  }

  /**
   * Finds the SHA-256 hash associated with a given path in the index file.
   *
   * @param {string} path - The path to search for in the index file.
   * @returns {string | null} The SHA-256 hash associated with the path if found, or null if not found.
   */
  private findSha256ByPath = (path: string): string | null => {
    for (const key in this.indexFile) {
      if (this.indexFile[key].path === path) {
        return this.indexFile[key].sha256
      }
    }

    return null
  }

  /**
   * Determines the file name for a given path.
   *
   * If the path is equal to the index file name, returns the index file name.
   * Otherwise, it finds the SHA-256 hash associated with the path in the index file.
   *
   * @param {string} path - The path to determine the file name for.
   * @returns {string | null} The file name associated with the path if found, or null if not found.
   */
  private fileNameForPath = (path: string): string | null => {
    return path === this.indexFileName ? this.indexFileName : this.findSha256ByPath(path)
  }

  /**
   * Checks if a file exists at a specific path in the document directory.
   *
   * @param {string} fileName - The name of the file to check.
   * @returns {Promise<boolean>} A promise that resolves to true if the file exists, or false otherwise.
   * @throws Will throw an error if the existence check fails.
   */
  private checkFileExists = async (fileName: string): Promise<boolean> => {
    const pathToFile = `${DocumentDirectoryPath}/${fileName}`

    try {
      const fileExists = await exists(pathToFile)
      this.log?.info(`File ${fileName} ${fileExists ? 'does ' : 'does not '} exist at ${pathToFile}`)
      return fileExists
    } catch (error) {
      this.log?.error(`Failed to check existence of ${fileName} at ${pathToFile}`)
    }

    return false
  }

  /**
   * Saves a string of data to a file in the local storage.
   *
   * @param {string} fileName - The name of the file to save.
   * @param {string} data - The data to write to the file.
   * @returns {Promise<boolean>} A promise that resolves to true if the file was saved successfully, or false otherwise.
   * @throws Will throw an error if the write operation fails.
   */
  private saveFileToLocalStorage = async (fileName: string, data: string): Promise<boolean> => {
    const pathToFile = `${DocumentDirectoryPath}/${fileName}`

    try {
      await writeFile(pathToFile, data, 'utf8')
      this.log?.info(`File ${fileName} saved to ${pathToFile}`)

      return true
    } catch (error) {
      this.log?.error(`Failed to save file ${fileName} to ${pathToFile}, ${error}`)
    }

    return false
  }

  /**
   * Loads a file from local storage.
   *
   * @param fileName - The name of the file to load.
   * @returns A promise that resolves to the contents of the file, or undefined if the file does not exist.
   */
  private loadFileFromLocalStorage = async (fileName: string): Promise<string | undefined> => {
    const pathToFile = `${DocumentDirectoryPath}/${fileName}`

    try {
      const fileExists = await this.checkFileExists(fileName)
      if (!fileExists) {
        return
      }

      const data = await readFile(pathToFile, 'utf8')
      this.log?.info(`File ${fileName} loaded from ${pathToFile}`)

      return data
    } catch (error) {
      this.log?.error(`Failed to load file ${fileName} from ${pathToFile}`)
    }
  }

  /**
   * Fetches a remote resource from the specified path.
   *
   * @param path - The path of the remote resource.
   * @param useCachedOnFail - Optional. Specifies whether to use the cached data if the fetch fails. Default is true.
   * @returns A Promise that resolves to the fetched data, or undefined if the fetch fails and no cached data is available.
   */
  private fetchRemoteResource = async (path: string, useCachedOnFail = true): Promise<any> => {
    let response: axios.AxiosResponse<any, any> | undefined = undefined
    try {
      response = await this.axiosInstance.get(path)
    } catch (error) {
      this.log?.error(`Failed to fetch remote resource at ${path}`)
    }

    if ((!response || response.status !== 200) && useCachedOnFail) {
      this.log?.error(`Failed to fetch, loading ${path} from cache`)
      const loadFileName = this.fileNameForPath(path)
      if (loadFileName) {
        const cachedData = await this.loadFileFromLocalStorage(loadFileName)
        if (cachedData) {
          return JSON.parse(cachedData)
        }
      } else {
        this.log?.error(`Failed to determine file name for path ${path} for save`)
      }

      return
    }

    if (response && response.data) {
      const saveFileName = this.fileNameForPath(path)
      if (saveFileName) {
        await this.saveFileToLocalStorage(saveFileName, JSON.stringify(response.data))
      } else {
        this.log?.error(`Failed to determine file name for path ${path} for load`)
      }
    }

    return response ? response.data : undefined
  }

  /**
   * Loads the OCA index file from a remote resource.
   *
   * @param fileName - The name of the file to load.
   * @returns A Promise that resolves with the loaded data.
   */
  private loadOCAIndex = async (fileName: string) => {
    const data = await this.fetchRemoteResource(fileName)

    this.indexFile = data
  }

  /**
   * Loads the Overlay Content Archive (OCA) bundle from a remote resource.
   *
   * @param fileName - The name of the file to load.
   * @returns A promise that resolves to an array of Overlay Bundle Data.
   */
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
    const identifier = schemaId || credentialDefinitionId || templateId

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
