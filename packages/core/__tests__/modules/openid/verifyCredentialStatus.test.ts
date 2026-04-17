import { SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { verifyCredentialStatus } from '../../../src/modules/openid/refresh/verifyCredentialStatus'
import { RefreshStatus } from '../../../src/modules/openid/refresh/types'
import { getListFromStatusListJWT, getStatusListFromJWT } from '@sd-jwt/jwt-status-list'

jest.mock('@sd-jwt/jwt-status-list', () => ({
  getListFromStatusListJWT: jest.fn(),
  getStatusListFromJWT: jest.fn(),
}))

const mockGetListFromStatusListJWT = getListFromStatusListJWT as jest.Mock
const mockGetStatusListFromJWT = getStatusListFromJWT as jest.Mock

const createRecord = <T extends object>(prototype: T, values: Record<string, unknown> = {}) => {
  const record = Object.create(prototype)
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(record, key, {
      value,
      configurable: true,
      enumerable: true,
      writable: true,
    })
  }
  return record
}

describe('verifyCredentialStatus', () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.Mock
  })

  test('treats non-sd-jwt records as valid', async () => {
    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'w3c-1',
    })

    await expect(verifyCredentialStatus(record as any, logger as any)).resolves.toBe(RefreshStatus.Valid)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('returns valid when the status list entry is 0', async () => {
    const record = createRecord(SdJwtVcRecord.prototype, {
      id: 'sdjwt-1',
      firstCredential: {
        compact: 'header.payload.signature',
      },
      compactSdJwtVc: 'header.payload.signature',
    })

    mockGetStatusListFromJWT.mockReturnValue({
      uri: 'https://issuer.example/status',
      idx: 2,
    })
    mockGetListFromStatusListJWT.mockReturnValue({
      getStatus: jest.fn().mockReturnValue(0),
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('status-list-jwt'),
    })

    await expect(verifyCredentialStatus(record as any, logger as any)).resolves.toBe(RefreshStatus.Valid)
  })

  test('returns invalid when the status list entry is revoked', async () => {
    const record = createRecord(SdJwtVcRecord.prototype, {
      id: 'sdjwt-2',
      firstCredential: {
        compact: 'header.payload.signature',
      },
      compactSdJwtVc: 'header.payload.signature',
    })

    mockGetStatusListFromJWT.mockReturnValue({
      uri: 'https://issuer.example/status',
      idx: 1,
    })
    mockGetListFromStatusListJWT.mockReturnValue({
      getStatus: jest.fn().mockReturnValue(1),
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('status-list-jwt'),
    })

    await expect(verifyCredentialStatus(record as any, logger as any)).resolves.toBe(RefreshStatus.Invalid)
  })

  test('returns error when status verification throws', async () => {
    const record = createRecord(SdJwtVcRecord.prototype, {
      id: 'sdjwt-3',
      firstCredential: {
        compact: 'header.payload.signature',
      },
      compactSdJwtVc: 'header.payload.signature',
    })

    mockGetStatusListFromJWT.mockReturnValue({
      uri: 'https://issuer.example/status',
      idx: 1,
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(verifyCredentialStatus(record as any, logger as any)).resolves.toBe(RefreshStatus.Error)
    expect(logger.error).toHaveBeenCalled()
  })
})
