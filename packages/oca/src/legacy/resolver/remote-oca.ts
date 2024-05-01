import axios from 'axios'
import { CachesDirectoryPath, readFile, writeFile, exists, mkdir, unlink } from 'react-native-fs'

import { IOverlayBundleData } from '../../interfaces'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay, OverlayBundle } from '../../types'
import { generateColor } from '../../utils'
import {
  ocaBundleStorageDirectory,
  ocaCacheDataFileName,
  defaultBundleIndexFileName,
  defaultBundleLanguage,
} from '../../constants'
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

enum OCABundleQueueEntryOperation {
  Add = 'add',
  Remove = 'remove',
}

type OCABundleQueueEntry = {
  sha256: string
  operation: OCABundleQueueEntryOperation
}

type CacheDataFile = {
  indexFileEtag: string

  updatedAt: Date
}

export class RemoteOCABundleResolver extends DefaultOCABundleResolver {
  protected indexFile: BundleIndex = {}
  private axiosInstance: axios.AxiosInstance
  private cacheDataFileName = ocaCacheDataFileName
  private indexFileName: string
  private _indexFileEtag?: string

  constructor(indexFileBaseUrl: string, options?: RemoteOCABundleResolverOptions) {
    super({}, options)

    this.indexFileName = options?.indexFileName || defaultBundleIndexFileName
    this.axiosInstance = axios.create({
      baseURL: indexFileBaseUrl,
    })
  }

  set indexFileEtag(value: string) {
    if (!value) {
      return
    }

    this._indexFileEtag = value
    this.saveCacheData({
      indexFileEtag: value,
      updatedAt: new Date(),
    }).catch((error) => {
      this.log?.error(`Failed to save cache data, ${error}`)
    })
  }

  get indexFileEtag(): string {
    return this._indexFileEtag || ''
  }

  public async checkForUpdates(): Promise<void> {
    try {
      await this.createWorkingDirectoryIfNotExists()

      if (!this.indexFileEtag) {
        this.log?.info('Loading cache data')

        const cacheData = await this.loadCacheData()
        if (cacheData) {
          this.indexFileEtag = cacheData.indexFileEtag
        }
      }

      this.log?.info('Loading OCA index now')
      await this.loadOCAIndex(this.indexFileName)
    } catch (error) {}
  }

  private loadCacheData = async (): Promise<CacheDataFile | undefined> => {
    const cacheFileExists = await this.checkFileExists(this.cacheDataFileName)
    if (!cacheFileExists) {
      return
    }

    const data = await this.loadFileFromLocalStorage(this.cacheDataFileName)
    if (!data) {
      return
    }

    const cacheData: CacheDataFile = JSON.parse(data)

    return cacheData
  }

  private saveCacheData = async (cacheData: CacheDataFile): Promise<boolean> => {
    const cacheDataAsString = JSON.stringify(cacheData)

    return this.saveFileToLocalStorage(this.cacheDataFileName, cacheDataAsString)
  }

  private processQueue = async (items: Array<OCABundleQueueEntry>): Promise<OCABundleQueueEntry[]> => {
    const processed = Array<OCABundleQueueEntry>()
    const operations = []

    for (const q of items) {
      const hash = q.sha256

      this.log?.info(`Processing op ${q.operation} for ${hash}`)

      switch (q.operation) {
        case OCABundleQueueEntryOperation.Add:
          const path = this.findPathBySha256(hash)
          if (!path) {
            continue
          }
          operations.push(this.fetchOCABundle(path))

          break
        case OCABundleQueueEntryOperation.Remove:
          operations.push(this.removeFileFromLocalStorage(hash))
          break
      }
    }

    try {
      // Check which operations were successful, and remove them from
      // the queue.
      const settled = await Promise.allSettled(operations)
      for (const i in settled) {
        if (settled[i].status === 'fulfilled') {
          processed.push(items[i])
        }
      }

      return Array.from(processed) ?? []
    } catch (error) {
      this.log?.error(`Failed to process some operations, ${error}`)

      return []
    }
  }

  private prepareBundleQueue = (newIndexFile: BundleIndex, oldIndexFile: BundleIndex): Array<OCABundleQueueEntry> => {
    const oldIndexItemHashes = [...new Set(Object.keys(oldIndexFile).map((key) => oldIndexFile[key].sha256))]
    const newIndexItemHashes = [...new Set(Object.keys(newIndexFile).map((key) => newIndexFile[key].sha256))]

    // if the SHA256 is in the old index file but not in
    // the new index file, it should be removed.
    const hashesToRemove = oldIndexItemHashes
      .filter((hash) => !newIndexItemHashes.includes(hash))
      .map((hash) => ({
        sha256: hash,
        operation: OCABundleQueueEntryOperation.Remove,
      }))

    // if the SHA256 is in the new index file but not in
    // the old index file, it should be added.
    const hashesToAdd = newIndexItemHashes
      .filter((hash) => !oldIndexItemHashes.includes(hash))
      .map((hash) => ({
        sha256: hash,
        operation: OCABundleQueueEntryOperation.Add,
      }))

    this.log?.info(`Files to remove ${hashesToRemove.length}, add ${hashesToAdd.length}`)

    return [...hashesToRemove, ...hashesToAdd]
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

  private findPathBySha256 = (sha256: string): string | null => {
    for (const key of Object.keys(this.indexFile)) {
      const hash = this.indexFile[key].sha256
      if (hash === sha256) {
        return this.indexFile[key].path
      }
    }

    return null
  }

  private fileNameForBundleAtPath = (path: string): string | null => {
    return this.findSha256ByPath(path)
  }

  private fileStoragePath = (): string => {
    return `${CachesDirectoryPath}/${ocaBundleStorageDirectory}`
  }

  /**
   * Checks if a file exists at a specific path in the document directory.
   *
   * @param {string} fileName - The name of the file to check.
   * @returns {Promise<boolean>} A promise that resolves to true if the file exists, or false otherwise.
   * @throws Will throw an error if the existence check fails.
   */
  private checkFileExists = async (fileName: string): Promise<boolean> => {
    const pathToFile = `${this.fileStoragePath()}/${fileName}`

    try {
      const fileExists = await exists(pathToFile)
      this.log?.info(`File ${fileName} ${fileExists ? 'does' : 'does not'} exist at ${pathToFile}`)
      return fileExists
    } catch (error) {
      this.log?.error(`Failed to check existence of ${fileName} at ${pathToFile}`)
    }

    return false
  }

  private createWorkingDirectoryIfNotExists = async (): Promise<boolean> => {
    const workSpace = this.fileStoragePath()
    const pathDoesExist = await exists(workSpace)

    if (!pathDoesExist) {
      try {
        await mkdir(workSpace)
        return true
      } catch (error) {
        this.log?.error(`Failed to create directory ${workSpace}`)
        return false
      }
    }

    return true
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
    const pathToFile = `${this.fileStoragePath()}/${fileName}`

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
    const pathToFile = `${this.fileStoragePath()}/${fileName}`

    try {
      const fileExists = await this.checkFileExists(fileName)
      if (!fileExists) {
        this.log?.warn(`Missing ${fileName} from ${pathToFile}`)

        return
      }

      const data = await readFile(pathToFile, 'utf8')
      this.log?.info(`File ${fileName} loaded from ${pathToFile}`)

      return data
    } catch (error) {
      this.log?.error(`Failed to load file ${fileName} from ${pathToFile}`)
    }
  }

  private removeFileFromLocalStorage = async (fileName: string): Promise<boolean> => {
    const pathToFile = `${this.fileStoragePath()}/${fileName}`

    try {
      await unlink(pathToFile)
      return true
    } catch (error) {
      this.log?.error(`Failed to unlink file ${fileName} from ${pathToFile}`)
    }

    return false
  }

  private fetchOCABundle = async (path: string): Promise<boolean> => {
    const response = await this.axiosInstance.get(path)
    const { status } = response

    if (status !== 200) {
      this.log?.error(`Failed to fetch remote resource at ${path}`)

      return false
    }

    const fileName = this.fileNameForBundleAtPath(path)
    if (!fileName) {
      this.log?.error(`Failed to determine file name ${fileName} for save`)

      return false
    }

    return this.saveFileToLocalStorage(fileName, JSON.stringify(response.data))
  }

  private loadOCAIndex = async (filePath: string) => {
    try {
      const response = await this.axiosInstance.get(filePath)
      const { status } = response
      const { etag } = response.headers

      if (status !== 200) {
        this.log?.error(`Failed to fetch remote resource at ${filePath}`)
        // failed to fetch, use the cached index file
        // if available
        const data = await this.loadFileFromLocalStorage(filePath)
        if (data) {
          this.log?.info(`Using index file ${filePath} from cache`)
          this.indexFile = JSON.parse(data)
        }

        return
      }

      if (etag && etag === this.indexFileEtag) {
        this.log?.info(`Index file ${filePath} has not changed, etag ${etag}`)
        // etag is the same, no need to refresh
        this.indexFile = response.data

        return
      }

      // etag is different, we need to refresh the
      // index file and the bundles.
      const items = this.prepareBundleQueue(response.data, this.indexFile)
      this.indexFile = response.data
      this.indexFileEtag = etag

      await this.processQueue(items)
      await this.saveFileToLocalStorage(filePath, JSON.stringify(this.indexFile))
    } catch (error) {
      this.log?.error(`Failed to fetch OCA index ${filePath}`)
    }
  }

  private loadOCABundle = async (path: string): Promise<IOverlayBundleData[]> => {
    // check if the file exists in the local storage
    // if it does, load it from there.
    const fileName = this.fileNameForBundleAtPath(path)
    if (!fileName) {
      this.log?.error(`Failed to determine file name ${fileName} for save`)
      return []
    }

    const data = await this.loadFileFromLocalStorage(fileName!)
    if (data) {
      return JSON.parse(data)
    }

    // the queue is empty, try to fetch the file
    const cachedData = await this.loadFileFromLocalStorage(fileName)
    if (!cachedData) {
      return []
    }

    return JSON.parse(cachedData)
  }

  private matchBundleIndexEntry = (identifiers: Identifiers): string | undefined => {
    const { schemaId, credentialDefinitionId, templateId } = identifiers
    // If more than one candidate identifier exists in the index file then
    // order matters here.
    const candidates = [schemaId, credentialDefinitionId, templateId].filter(
      (value) => value !== undefined && value !== null && value !== ''
    )

    if (candidates.length === 0) {
      return undefined
    }

    const keys = Object.keys(this.indexFile)
    const identifier = candidates.find((c) => keys.includes(c!))

    return identifier
  }

  public async resolve(params: {
    identifiers: Identifiers
    language?: string | undefined
  }): Promise<OCABundle | undefined> {
    const language = params.language || defaultBundleLanguage
    const identifier = this.matchBundleIndexEntry(params.identifiers)

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
