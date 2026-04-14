import { refreshAndQueueReplacement } from '../../../src/modules/openid/refresh/operations'
import { refreshAccessToken } from '../../../src/modules/openid/refresh/refreshToken'
import { reissueCredentialWithAccessToken } from '../../../src/modules/openid/refresh/reIssuance'
import { credentialRegistry } from '../../../src/modules/openid/refresh/registry'

jest.mock('../../../src/modules/openid/refresh/refreshToken', () => ({
  refreshAccessToken: jest.fn(),
}))

jest.mock('../../../src/modules/openid/refresh/reIssuance', () => ({
  reissueCredentialWithAccessToken: jest.fn(),
}))

const mockRefreshAccessToken = refreshAccessToken as jest.Mock
const mockReissueCredentialWithAccessToken = reissueCredentialWithAccessToken as jest.Mock

describe('refreshAndQueueReplacement', () => {
  const logger = {
    info: jest.fn(),
  }
  const agent = {
    context: { id: 'agent-context' },
  }
  const record = {
    id: 'old-cred',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    credentialRegistry.getState().reset()
  })

  test('returns undefined when access token refresh does not yield a token', async () => {
    mockRefreshAccessToken.mockResolvedValue(undefined)

    await expect(
      refreshAndQueueReplacement({
        agent: agent as any,
        logger: logger as any,
        record: record as any,
      })
    ).resolves.toBeUndefined()

    expect(mockReissueCredentialWithAccessToken).not.toHaveBeenCalled()
    expect(credentialRegistry.getState().expired).toEqual([])
  })

  test('returns undefined when re-issuance does not yield a record', async () => {
    mockRefreshAccessToken.mockResolvedValue({ access_token: 'access-token' })
    mockReissueCredentialWithAccessToken.mockResolvedValue(undefined)

    await expect(
      refreshAndQueueReplacement({
        agent: agent as any,
        logger: logger as any,
        record: record as any,
      })
    ).resolves.toBeUndefined()

    expect(credentialRegistry.getState().replacements).toEqual({})
  })

  test('queues a replacement in the registry when refresh succeeds', async () => {
    const newRecord = {
      id: 'new-cred',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      getTags: jest.fn().mockReturnValue({ claimFormat: 'jwt_vc' }),
    }

    mockRefreshAccessToken.mockResolvedValue({ access_token: 'access-token' })
    mockReissueCredentialWithAccessToken.mockResolvedValue(newRecord)

    const result = await refreshAndQueueReplacement({
      agent: agent as any,
      logger: logger as any,
      record: record as any,
      toLite: (rec) => ({
        id: rec.id,
        format: 'jwt_vc' as any,
      }),
    })

    expect(result).toBe(newRecord)
    expect(credentialRegistry.getState().expired).toEqual(['old-cred'])
    expect(credentialRegistry.getState().replacements).toEqual({
      'old-cred': {
        id: 'new-cred',
        format: 'jwt_vc',
      },
    })
  })
})
