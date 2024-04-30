import { RemoteOCABundleResolver } from '../src/legacy/resolver/remote-oca'
import fs from 'fs'
import { ocaCacheDataFileName, defaultBundleIndexFileName } from '../src/constants'
import axios from 'axios'
import MiniLogger from '../src/utils/logger'

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

const get = axios.create().get as jest.Mock

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
}))

describe('RemoteOCABundleResolver', () => {
  let resolver: RemoteOCABundleResolver

  beforeEach(() => {
    resolver = new RemoteOCABundleResolver('http://example.com')
    resolver.log = new MiniLogger()

    jest.clearAllMocks()
  })

  afterEach(() => {
    resolver.stop()
  })

  it('should be created', async () => {
    expect(resolver).toBeTruthy()
    expect(resolver).toBeInstanceOf(RemoteOCABundleResolver)
    expect(resolver).toHaveProperty('indexFileName', defaultBundleIndexFileName)
    expect(resolver).toHaveProperty('cacheDataFileName', ocaCacheDataFileName)
    expect(resolver['axiosInstance']).not.toBeNull()
    expect(resolver['lastQueueCheck']).not.toBeNull()
    expect(get).toBeCalledTimes(0)
    expect(resolver.indexFileEtag).toEqual('')
    expect(resolver.queue).toMatchSnapshot()
    expect(resolver['indexFile']).toMatchSnapshot()
  })

  it('should stop on demand', async () => {
    const get = axios.create().get as jest.Mock
    get.mockResolvedValue({
      status: 200,
      data: JSON.parse(indexAsString),
      headers: { etag: initialEtag },
    })

    await resolver.start()
    resolver.stop()

    expect(resolver.indexFileEtag).toEqual(initialEtag)
    expect(get).toBeCalledTimes(2) // TODO(jl): why 2 and not 1? Probably getting a bundle.
    expect(resolver.queue).toMatchSnapshot()
    expect(resolver['indexFile']).toMatchSnapshot()
  })

  it('should do something cool', async () => {
    const get = axios.create().get as jest.Mock
    get.mockResolvedValue({
      status: 200,
      data: JSON.parse(indexAsString),
      headers: { etag: initialEtag },
    })

    await resolver.start()

    expect(resolver.indexFileEtag).toEqual(initialEtag)
    expect(get).toBeCalledTimes(2) // TODO(jl): why 2 and not 1? Probably getting a bundle.
    expect(resolver.queue).toMatchSnapshot()
    expect(resolver['indexFile']).toMatchSnapshot()
  })
})
