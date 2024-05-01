import { RemoteOCABundleResolver } from '../src/legacy/resolver/remote-oca'
import fs from 'fs'
import { ocaCacheDataFileName, defaultBundleIndexFileName } from '../src/constants'
import axios from 'axios'
import MiniLogger from '../src/utils/logger'
import { readFile, writeFile, exists, mkdir, unlink } from 'react-native-fs'

const bundleFileName = 'bundle.json'
const ocaPath = `${__dirname}/fixtures/${ocaCacheDataFileName}`
const ocaAsString = fs.readFileSync(ocaPath, 'utf8')
const indexPath = `${__dirname}/fixtures/${defaultBundleIndexFileName}`
const indexAsString = fs.readFileSync(indexPath, 'utf8')
const bundlePath = `${__dirname}/fixtures/${bundleFileName}`
const bundleAsString = fs.readFileSync(bundlePath, 'utf8')

const initialEtag = '3379dc5c38ac34ab'
const changedEtag = '4c0afc9bfdb3bf6b'
const keysToUpdated = [
  '79e343ab4362d93974cdf78b00a916a5b3659178dfd170fcff90f1b5f10ceb72',
  '29bf8f8729f235450980d0b273f9ca49b7ab73b7358467bf52b311bf40464bb0',
]

const getMock = jest.fn().mockImplementation((url) => {
  const fileName = url.split('/').pop()
  switch (fileName) {
    case 'ocabundles.json':
      return Promise.resolve({
        status: 200,
        data: JSON.parse(indexAsString),
        headers: { etag: initialEtag },
      })
    case 'OCABundle.json':
      return Promise.resolve({
        status: 200,
        data: JSON.parse(bundleAsString),
      })
    default:
      return Promise.reject(new Error('Not Found'))
  }
})

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}))

jest.useFakeTimers({ legacyFakeTimers: true })

jest.mock('react-native-fs', () => ({
  exists: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(true),
  readFile: jest.fn().mockImplementation((filePath) => {
    const fileName = filePath.split('/').pop()
    switch (fileName) {
      case ocaCacheDataFileName: {
        return Promise.resolve(ocaAsString)
      }
      case defaultBundleIndexFileName:
        return Promise.resolve(indexAsString)
      default:
        return Promise.resolve('{}')
    }
  }),
  writeFile: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(true),
}))

describe('RemoteOCABundleResolver', () => {
  let resolver: RemoteOCABundleResolver

  beforeEach(() => {
    resolver = new RemoteOCABundleResolver('http://example.com')
    // resolver.log = new MiniLogger()

    jest.clearAllMocks()
    // @ts-ignore
    axios.create().get.mockImplementation(getMock)
  })

  it('should be created', async () => {
    expect(resolver).toBeTruthy()
    expect(resolver).toBeInstanceOf(RemoteOCABundleResolver)
    expect(resolver).toHaveProperty('indexFileName', defaultBundleIndexFileName)
    expect(resolver).toHaveProperty('cacheDataFileName', ocaCacheDataFileName)
    expect(resolver['axiosInstance']).not.toBeNull()
    expect(axios.create().get).toHaveBeenCalledTimes(0)
    expect(resolver.indexFileEtag).toEqual('')
    expect(resolver['indexFile']).toMatchSnapshot()
  })

  it('should update demand', async () => {
    await resolver.checkForUpdates()

    expect(axios.create().get).toHaveBeenCalledTimes(16) // 1 index + 15 bundles
    expect(writeFile).toHaveBeenCalledTimes(17) // 1 index + 15 bundles + 1 cache
    expect(readFile).toHaveBeenCalledTimes(1) // 1 cache
    expect(unlink).toHaveBeenCalledTimes(0) // 0 deletes
    expect(exists).toHaveBeenCalledTimes(3) // 1 index + 1 cache + 1 directory
    expect(mkdir).toHaveBeenCalledTimes(0) // mock always return true
    expect(resolver.indexFileEtag).toEqual(initialEtag)
    expect(resolver['indexFile']).toMatchSnapshot()
  })

  it('should check index periodically', async () => {
    await resolver.checkForUpdates()
    await resolver.checkForUpdates()
    await resolver.checkForUpdates()

    expect(axios.create().get).toHaveBeenCalledTimes(18) // 3 index + 15 bundles
    expect(writeFile).toHaveBeenCalledTimes(17) // 1 index + 15 bundles + 1 cache
    expect(readFile).toHaveBeenCalledTimes(1)
    expect(unlink).toHaveBeenCalledTimes(0)
    expect(exists).toHaveBeenCalledTimes(5)
    expect(mkdir).toHaveBeenCalledTimes(0)
  })

  it('should check fetch updated bundles', async () => {
    await resolver.checkForUpdates()

    expect(axios.create().get).toHaveBeenCalledTimes(16) // 1 index + 15 bundles
    expect(resolver.indexFileEtag).toEqual(initialEtag)

    const newIndexAsJSON = JSON.parse(indexAsString)
    for (const key of Object.keys(newIndexAsJSON)) {
      if (keysToUpdated.includes(newIndexAsJSON[key].sha256)) {
        newIndexAsJSON[key].sha256 = newIndexAsJSON[key].sha256.slice(0, 7)
      }
    }

    // @ts-ignore
    axios.create().get.mockImplementation((url) => {
      const fileName = url.split('/').pop()
      switch (fileName) {
        case 'ocabundles.json':
          return Promise.resolve({
            status: 200,
            data: newIndexAsJSON,
            headers: { etag: changedEtag },
          })
        case 'OCABundle.json':
          return Promise.resolve({
            status: 200,
            data: JSON.parse(bundleAsString),
          })
        default:
          return Promise.reject(new Error('Not Found'))
      }
    })

    await resolver.checkForUpdates()

    expect(axios.create().get).toHaveBeenCalledTimes(19) // 2 index + 17 bundles
    expect(writeFile).toHaveBeenCalledTimes(21) // 2 index + 17 bundles + 2 cache
    expect(readFile).toHaveBeenCalledTimes(1)
    expect(unlink).toHaveBeenCalledTimes(2) // 2 deletes
    expect(exists).toHaveBeenCalledTimes(4) // 2 index + 1 cache + 1 directory
    expect(mkdir).toHaveBeenCalledTimes(0)
    expect(resolver.indexFileEtag).toEqual(changedEtag)
    expect(resolver['indexFile']).toMatchSnapshot()
  })
})
