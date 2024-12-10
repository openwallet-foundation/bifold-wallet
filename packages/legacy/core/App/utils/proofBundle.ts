import { BaseLogger } from '@credo-ts/core'
import {
  AnonCredsProofRequestTemplatePayload,
  ProofRequestTemplate,
  getProofRequestTemplates,
} from '@hyperledger/aries-bifold-verifier'
import { useState, useEffect } from 'react'

import { TOKENS, useServices } from '../container-api'
import { templateBundleStorageDirectory, templateCacheDataFileName, templateBundleIndexFileName } from '../constants'
import { FileCache, CacheDataFile } from './fileCache'

type ProofRequestTemplateFn = (useDevTemplates: boolean) => Array<ProofRequestTemplate>

const calculatePreviousYear = (yearOffset: number) => {
  const pastDate = new Date()
  pastDate.setFullYear(pastDate.getFullYear() + yearOffset)
  return parseInt(pastDate.toISOString().split('T')[0].replace(/-/g, ''))
}

export const applyTemplateMarkers = (templates: any): any => {
  if (!templates) {
    return templates
  }

  const markerActions: { [key: string]: (param: string) => string } = {
    now: () => Math.floor(new Date().getTime() / 1000).toString(),
    currentDate: (offset: string) => calculatePreviousYear(parseInt(offset)).toString(),
  }

  let templateString = JSON.stringify(templates)
  // regex to find all markers in the template so we can replace
  // them with computed values
  const markers = [...templateString.matchAll(/"@\{(\w+)(?:\((\S*)\))?\}"/gm)]

  markers.forEach((marker) => {
    const markerValue = markerActions[marker[1] as string](marker[2])
    templateString = templateString.replace(marker[0], markerValue)
  })

  return JSON.parse(templateString)
}

export const applyDevRestrictions = (templates: ProofRequestTemplate[]): ProofRequestTemplate[] => {
  return templates.map((temp) => {
    return {
      ...temp,
      payload: {
        ...temp.payload,
        data: (temp.payload as AnonCredsProofRequestTemplatePayload).data.map((data) => {
          return {
            ...data,
            requestedAttributes: data.requestedAttributes?.map((attr) => {
              return {
                ...attr,
                restrictions: [...(attr.restrictions ?? []), ...(attr.devRestrictions ?? [])],
                devRestrictions: [],
              }
            }),
            requestedPredicates: data.requestedPredicates?.map((pred) => {
              return {
                ...pred,
                restrictions: [...(pred.restrictions ?? []), ...(pred.devRestrictions ?? [])],
                devRestrictions: [],
              }
            }),
          }
        }),
      },
    }
  })
}

export interface IProofBundleResolver {
  resolve: (acceptDevRestrictions: boolean) => Promise<ProofRequestTemplate[] | undefined>
  resolveById: (templateId: string, acceptDevRestrictions: boolean) => Promise<ProofRequestTemplate | undefined>
}

export const useRemoteProofBundleResolver = (
  indexFileBaseUrl: string | undefined,
  log?: BaseLogger
): IProofBundleResolver => {
  const [proofRequestTemplates] = useServices([TOKENS.UTIL_PROOF_TEMPLATE])
  const [resolver, setResolver] = useState<IProofBundleResolver>(new DefaultProofBundleResolver(proofRequestTemplates))

  useEffect(() => {
    if (indexFileBaseUrl) {
      setResolver(new RemoteProofBundleResolver(indexFileBaseUrl, log))
    } else {
      setResolver(new DefaultProofBundleResolver(proofRequestTemplates))
    }
  }, [log, indexFileBaseUrl, proofRequestTemplates])

  return resolver
}

export class RemoteProofBundleResolver extends FileCache implements IProofBundleResolver {
  private templateData: ProofRequestTemplate[] | undefined
  private cacheDataFileName = templateCacheDataFileName

  public constructor(indexFileBaseUrl: string, log?: BaseLogger) {
    super(indexFileBaseUrl, templateBundleStorageDirectory, templateBundleIndexFileName, log)
  }

  public async resolve(acceptDevRestrictions: boolean): Promise<ProofRequestTemplate[] | undefined> {
    let templateData

    if (!this.templateData) {
      await this.checkForUpdates()
    }

    if (!this.templateData) {
      return []
    }

    templateData = this.templateData

    if (acceptDevRestrictions) {
      templateData = applyDevRestrictions(this.templateData)
    }

    return Promise.resolve(templateData)
  }

  public async resolveById(
    templateId: string,
    acceptDevRestrictions: boolean
  ): Promise<ProofRequestTemplate | undefined> {
    let templateData

    if (!this.templateData) {
      return (await this.resolve(acceptDevRestrictions))?.find((template) => template.id === templateId)
    }

    templateData = this.templateData

    if (acceptDevRestrictions) {
      templateData = applyDevRestrictions(templateData)
    }

    return templateData.find((template) => template.id === templateId)
  }

  public async checkForUpdates(): Promise<void> {
    await this.createWorkingDirectoryIfNotExists()

    if (!this.fileEtag) {
      this.log?.info('Loading cache data')

      const cacheData = await this.loadCacheData()
      if (cacheData) {
        this.fileEtag = cacheData.fileEtag
      }
    }

    this.log?.info('Loading index now')
    await this.loadBundleIndex(this.cacheDataFileName)
  }

  private loadBundleIndex = async (filePath: string) => {
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
          this.templateData = JSON.parse(data)
        }

        return
      }

      if (etag && etag === this.fileEtag) {
        this.log?.info(`Index file ${filePath} has not changed, etag ${etag}`)
        // etag is the same, no need to refresh
        this.templateData = response.data

        return
      }

      this.fileEtag = etag
      this.templateData = response.data

      this.log?.info(`Saving file ${filePath}, etag ${etag}`)
      await this.saveFileToLocalStorage(filePath, JSON.stringify(this.templateData))
    } catch (error) {
      this.log?.error(`Failed to fetch file index ${filePath}`)
    }
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
}

export class DefaultProofBundleResolver implements IProofBundleResolver {
  private proofRequestTemplates

  public constructor(proofRequestTemplates: ProofRequestTemplateFn | undefined) {
    this.proofRequestTemplates = proofRequestTemplates ?? getProofRequestTemplates
  }

  public async resolve(acceptDevRestrictions: boolean): Promise<ProofRequestTemplate[]> {
    return Promise.resolve(this.proofRequestTemplates(acceptDevRestrictions))
  }

  public async resolveById(
    templateId: string,
    acceptDevRestrictions: boolean
  ): Promise<ProofRequestTemplate | undefined> {
    return Promise.resolve(
      this.proofRequestTemplates(acceptDevRestrictions).find((template) => template.id === templateId)
    )
  }
}
