import axios from 'axios'
import { CachesDirectoryPath, readFile, writeFile, exists, mkdir, unlink } from 'react-native-fs'

import { IOverlayBundleData } from '../../interfaces'
import { BaseOverlay, BrandingOverlay, LegacyBrandingOverlay, OverlayBundle } from '../../types'
import { generateColor } from '../../utils'
import { ocaBundleStorageDirectory, defaultBundleIndexFileName } from '../../constants'
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

class MiniLogger {
  warn(message: string) {
    console.warn(message)
  }
  error(message: string) {
    console.error(message)
  }
  info(message: string) {
    console.info(message)
  }
}

type OCABundleQueueEntry = {
  sha256: string
  operation: OCABundleQueueEntryOperation
}

export class RemoteOCABundleResolver extends DefaultOCABundleResolver {
  protected indexFile: BundleIndex = {}
  private axiosInstance: axios.AxiosInstance
  private indexFileName: string
  private indexFileEtag?: string
  private _queue: OCABundleQueueEntry[] = []

  constructor(indexFileBaseUrl: string, options?: RemoteOCABundleResolverOptions) {
    super({}, options)

    this.log = new MiniLogger()
    this.indexFileName = options?.indexFileName || defaultBundleIndexFileName
    this.axiosInstance = axios.create({
      baseURL: indexFileBaseUrl,
    })

    this.createWorkingDirectoryIfNotExists().then(() => {
      this.loadOCAIndex(this.indexFileName).catch((error) => {
        this.log?.error(`Failed to load OCA index ${this.indexFileName} on init, ${error}`)
      })
    })
  }

  set queue(value: Array<OCABundleQueueEntry>) {
    this._queue = value ?? []

    if (this._queue.length > 0) {
      this.processQueue()
    }
  }

  private processQueue = async () => {
    const processed = new Set<string>()
    for (const q of this._queue) {
      const hash = q.sha256
      const path = this.findPathBySha256(hash)
      if (!path) {
        continue
      }

      this.log?.info(`Processing queue op ${q.operation} for ${hash}`)

      try {
        switch (q.operation) {
          case OCABundleQueueEntryOperation.Add:
            await this.fetchOCABundle(path)

            break
          case OCABundleQueueEntryOperation.Remove:
            const fileName = this.fileNameForBundleAtPath(path)
            if (!fileName) {
              continue
            }

            await this.removeFileFromLocalStorage(fileName)
            break
        }

        processed.add(hash)
      } catch (error) {
        this.log?.error(`Failed to process queue op ${q.operation} for ${hash}, ${error}`)
      }
    }

    this._queue = this._queue.filter((q) => !processed.has(q.sha256))
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // let response: axios.AxiosResponse<any, any> | undefined = undefined

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
      this.queue = items

      this.saveFileToLocalStorage(filePath, JSON.stringify(this.indexFile))
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

    // if the file does not exist in the local storage
    // and we have a queue, we should wait for the queue
    // to be processed before trying to fetch the file.
    const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    // wait for 3, 6 then 9 seconds between checks
    for (let i = 0; i < 4; i++) {
      if (this.queue.length === 0) break
      await delay(3000 * (i + 1))
    }

    // if the queue is not empty, fail gracefully
    if (this.queue.length > 0) {
      return []
    }

    // the queue is empty, try to fetch the file
    const cachedData = await this.loadFileFromLocalStorage(fileName)
    if (!cachedData) {
      return []
    }

    return JSON.parse(cachedData)
  }

  public async resolve(params: {
    identifiers: Identifiers
    language?: string | undefined
  }): Promise<OCABundle | undefined> {
    const { schemaId, credentialDefinitionId, templateId } = params.identifiers
    const language = params.language || 'en'
    const identifier = schemaId || credentialDefinitionId || templateId

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
