import axios, { AxiosInstance } from 'axios'
import { CachesDirectoryPath, readFile, writeFile, exists, mkdir } from 'react-native-fs'

import { BifoldLogger } from '../services/logger'

export type CacheDataFile = {
  fileEtag: string
  updatedAt: Date
}

export class FileCache {
  protected axiosInstance: AxiosInstance
  protected _fileEtag?: string
  protected log?: BifoldLogger
  private workspace: string
  private cacheFileName

  public constructor(indexFileBaseUrl: string, workspace: string, cacheDataFileName: string, log?: BifoldLogger) {
    this.axiosInstance = axios.create({
      baseURL: indexFileBaseUrl,
    })

    this.workspace = workspace
    this.cacheFileName = cacheDataFileName
    this.log = log
  }

  set fileEtag(value: string) {
    if (!value) {
      return
    }

    this._fileEtag = value
    this.saveCacheData({
      fileEtag: value,
      updatedAt: new Date(),
    }).catch((error) => {
      this.log?.error(`Failed to save cache data, ${error}`)
    })
  }

  get fileEtag(): string {
    return this._fileEtag || ''
  }

  protected loadCacheData = async (): Promise<CacheDataFile | undefined> => {
    const cacheFileExists = await this.checkFileExists(this.cacheFileName)
    if (!cacheFileExists) {
      return
    }

    const data = await this.loadFileFromLocalStorage(this.cacheFileName)
    if (!data) {
      return
    }

    const cacheData: CacheDataFile = JSON.parse(data)
    return cacheData
  }

  protected saveCacheData = async (cacheData: CacheDataFile): Promise<boolean> => {
    const cacheDataAsString = JSON.stringify(cacheData)

    return this.saveFileToLocalStorage(this.cacheFileName, cacheDataAsString)
  }

  protected saveFileToLocalStorage = async (fileName: string, data: string): Promise<boolean> => {
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

  protected fileStoragePath = (): string => {
    return `${CachesDirectoryPath}/${this.workspace}`
  }

  protected createWorkingDirectoryIfNotExists = async (): Promise<boolean> => {
    const path = this.fileStoragePath()
    const pathDoesExist = await exists(path)

    if (!pathDoesExist) {
      try {
        await mkdir(path)
        return true
      } catch (error) {
        this.log?.error(`Failed to create directory ${path}`)
        return false
      }
    }

    return true
  }

  protected loadFileFromLocalStorage = async (fileName: string): Promise<string | undefined> => {
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

  protected checkFileExists = async (fileName: string): Promise<boolean> => {
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

  protected stripWeakEtag = (etag: string): string => {
    if (etag.startsWith('W/')) {
      return etag.slice(2).replace(/"/g, '')
    }

    return etag.replace(/"/g, '')
  }

  protected compareWeakEtags = (etag1: string, etag2: string): boolean => {
    const cleanEtag1 = this.stripWeakEtag(etag1)
    const cleanEtag2 = this.stripWeakEtag(etag2)

    return cleanEtag1 === cleanEtag2
  }
}
