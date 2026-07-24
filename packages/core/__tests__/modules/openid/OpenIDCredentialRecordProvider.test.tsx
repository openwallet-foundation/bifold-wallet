import React, { PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@testing-library/react-native'
import { ClaimFormat, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

import {
  OpenIDCredentialRecordProvider,
  useOpenIDCredentials,
} from '../../../src/modules/openid/context/OpenIDCredentialRecordProvider'
import { OpenIDCredentialType } from '../../../src/modules/openid/types'
import { useAppAgent } from '../../../src/utils/agent'
import { TOKENS, useServices } from '../../../src/container-api'
import {
  deleteOpenIDCredential,
  findOpenIDCredentialById,
  getOpenIDCredentialById,
  storeOpenIDCredential,
} from '../../../src/modules/openid/credentialRecord'
import { recordsAddedByType, recordsRemovedByType } from '@bifold/react-hooks/build/recordUtils'

jest.mock('../../../src/utils/agent', () => ({
  useAppAgent: jest.fn(),
}))

jest.mock('../../../src/container-api', () => ({
  TOKENS: {
    UTIL_LOGGER: 'UTIL_LOGGER',
  },
  useServices: jest.fn(),
}))

jest.mock('../../../src/modules/openid/credentialRecord', () => ({
  getOpenIDCredentialById: jest.fn(),
  findOpenIDCredentialById: jest.fn(),
  storeOpenIDCredential: jest.fn(),
  deleteOpenIDCredential: jest.fn(),
}))

jest.mock('@bifold/react-hooks/build/recordUtils', () => ({
  recordsAddedByType: jest.fn(),
  recordsRemovedByType: jest.fn(),
}))

const createRecord = <T extends object>(prototype: T, values: Record<string, unknown> = {}) =>
  Object.assign(Object.create(prototype), values)

const mockUseAppAgent = useAppAgent as jest.Mock
const mockUseServices = useServices as jest.Mock
const mockGetOpenIDCredentialById = getOpenIDCredentialById as jest.Mock
const mockFindOpenIDCredentialById = findOpenIDCredentialById as jest.Mock
const mockStoreOpenIDCredential = storeOpenIDCredential as jest.Mock
const mockDeleteOpenIDCredential = deleteOpenIDCredential as jest.Mock
const mockRecordsAddedByType = recordsAddedByType as jest.Mock
const mockRecordsRemovedByType = recordsRemovedByType as jest.Mock

describe('OpenIDCredentialRecordProvider', () => {
  const logger = {
    error: jest.fn(),
  }

  const createAgentMock = ({
    w3cRecords = [],
    sdJwtRecords = [],
  }: {
    w3cRecords?: W3cCredentialRecord[]
    sdJwtRecords?: SdJwtVcRecord[]
  } = {}) => ({
    w3cCredentials: {
      getAll: jest.fn().mockResolvedValue(w3cRecords),
    },
    sdJwtVc: {
      getAll: jest.fn().mockResolvedValue(sdJwtRecords),
    },
    events: {
      observable: {},
    },
  })

  const wrapper = ({ children }: PropsWithChildren) => (
    <OpenIDCredentialRecordProvider>{children}</OpenIDCredentialRecordProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseServices.mockImplementation((tokens) => {
      expect(tokens).toEqual([TOKENS.UTIL_LOGGER])
      return [logger]
    })

    const createSubscription = () => ({
      unsubscribe: jest.fn(),
    })

    mockRecordsAddedByType.mockReturnValue({
      subscribe: jest.fn(() => createSubscription()),
    })
    mockRecordsRemovedByType.mockReturnValue({
      subscribe: jest.fn(() => createSubscription()),
    })
  })

  test('loads and filters W3C and SD-JWT records into provider state', async () => {
    const jwtW3cRecord = createRecord(W3cCredentialRecord.prototype, {
      id: 'w3c-jwt',
      getTags: jest.fn().mockReturnValue({ claimFormat: ClaimFormat.JwtVc }),
    })
    const ldpW3cRecord = createRecord(W3cCredentialRecord.prototype, {
      id: 'w3c-ldp',
      getTags: jest.fn().mockReturnValue({ claimFormat: ClaimFormat.LdpVc }),
    })
    const sdJwtRecord = createRecord(SdJwtVcRecord.prototype, {
      id: 'sd-jwt',
      compactSdJwtVc: 'compact-token',
    })
    const nonSdJwtRecord = {
      id: 'not-sd-jwt',
    } as SdJwtVcRecord

    mockUseAppAgent.mockReturnValue({
      agent: createAgentMock({
        w3cRecords: [jwtW3cRecord, ldpW3cRecord],
        sdJwtRecords: [sdJwtRecord, nonSdJwtRecord],
      }),
    })

    const { result } = renderHook(() => useOpenIDCredentials(), { wrapper })

    await waitFor(() => {
      expect(result.current.openIdState.isLoading).toBe(false)
      expect(result.current.openIdState.w3cCredentialRecords.map((record) => record.id)).toEqual(['w3c-jwt'])
      expect(result.current.openIdState.sdJwtVcRecords.map((record) => record.id)).toEqual(['sd-jwt'])
    })

    expect(result.current.openIdState.mdocVcRecords).toEqual([])
    expect(result.current.openIdState.openIDCredentialRecords).toEqual([])
  })

  test('delegates credential lookup and storage helpers to credentialRecord utilities', async () => {
    const agent = createAgentMock()
    const w3cRecord = createRecord(W3cCredentialRecord.prototype, { id: 'w3c-id' })
    const sdJwtRecord = createRecord(SdJwtVcRecord.prototype, { id: 'sd-jwt-id' })
    const mdocRecord = createRecord(MdocRecord.prototype, { id: 'mdoc-id' })

    mockUseAppAgent.mockReturnValue({ agent })
    mockGetOpenIDCredentialById.mockImplementation((_agent, type, id) => {
      if (type === OpenIDCredentialType.W3cCredential && id === 'w3c-id') return Promise.resolve(w3cRecord)
      if (type === OpenIDCredentialType.SdJwtVc && id === 'sd-jwt-id') return Promise.resolve(sdJwtRecord)
      if (type === OpenIDCredentialType.Mdoc && id === 'mdoc-id') return Promise.resolve(mdocRecord)
      return Promise.resolve(undefined)
    })
    mockFindOpenIDCredentialById.mockResolvedValue(sdJwtRecord)

    const { result } = renderHook(() => useOpenIDCredentials(), { wrapper })

    await waitFor(() => {
      expect(result.current.openIdState.isLoading).toBe(false)
    })

    await expect(result.current.getW3CCredentialById('w3c-id')).resolves.toBe(w3cRecord)
    await expect(result.current.getSdJwtCredentialById('sd-jwt-id')).resolves.toBe(sdJwtRecord)
    await expect(result.current.getMdocCredentialById('mdoc-id')).resolves.toBe(mdocRecord)
    await expect(result.current.getCredentialById('w3c-id', OpenIDCredentialType.W3cCredential)).resolves.toBe(
      w3cRecord
    )
    await expect(result.current.getCredentialById('sd-jwt-id')).resolves.toBe(sdJwtRecord)

    await result.current.storeCredential(w3cRecord)
    await result.current.removeCredential(sdJwtRecord, OpenIDCredentialType.SdJwtVc)

    expect(mockGetOpenIDCredentialById).toHaveBeenCalledWith(agent, OpenIDCredentialType.W3cCredential, 'w3c-id')
    expect(mockGetOpenIDCredentialById).toHaveBeenCalledWith(agent, OpenIDCredentialType.SdJwtVc, 'sd-jwt-id')
    expect(mockGetOpenIDCredentialById).toHaveBeenCalledWith(agent, OpenIDCredentialType.Mdoc, 'mdoc-id')
    expect(mockFindOpenIDCredentialById).toHaveBeenCalledWith(agent, 'sd-jwt-id')
    expect(mockStoreOpenIDCredential).toHaveBeenCalledWith(agent, w3cRecord)
    expect(mockDeleteOpenIDCredential).toHaveBeenCalledWith(agent, sdJwtRecord)
  })
})
