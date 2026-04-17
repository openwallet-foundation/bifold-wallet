import { refreshAccessToken } from '../../../src/modules/openid/refresh/refreshToken'
import {
  getRefreshCredentialMetadata,
  persistCredentialRecord,
  setRefreshCredentialMetadata,
} from '../../../src/modules/openid/metadata'

jest.mock('../../../src/modules/openid/metadata', () => ({
  getRefreshCredentialMetadata: jest.fn(),
  persistCredentialRecord: jest.fn(),
  setRefreshCredentialMetadata: jest.fn(),
}))

const mockGetRefreshCredentialMetadata = getRefreshCredentialMetadata as jest.Mock
const mockPersistCredentialRecord = persistCredentialRecord as jest.Mock
const mockSetRefreshCredentialMetadata = setRefreshCredentialMetadata as jest.Mock

describe('refreshAccessToken', () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  }
  const credential = { id: 'cred-1' }
  const agentContext = { context: 'agent' }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.Mock
  })

  test('returns undefined when refresh metadata is missing', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue(undefined)

    await expect(
      refreshAccessToken({
        logger: logger as any,
        cred: credential as any,
        agentContext: agentContext as any,
      })
    ).resolves.toBeUndefined()

    expect(logger.error).toHaveBeenCalledWith('[refreshAccessToken] No refresh metadata found for credential: cred-1')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('refreshes an access token using form-encoded POST body', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenEndpoint: 'https://issuer.example/token/',
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        token_type: 'Bearer',
      }),
    })

    const result = await refreshAccessToken({
      logger: logger as any,
      cred: credential as any,
      agentContext: agentContext as any,
    })

    expect(global.fetch).toHaveBeenCalledWith('https://issuer.example/token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:
        'grant_type=refresh_token&refresh_token=refresh-token&pre_authorized_code=&pre_authorized_code_alt=&user_pin=',
    })
    expect(result).toEqual({
      access_token: 'new-access-token',
      token_type: 'Bearer',
    })
    expect(mockSetRefreshCredentialMetadata).not.toHaveBeenCalled()
    expect(mockPersistCredentialRecord).not.toHaveBeenCalled()
  })

  test('persists rotated refresh tokens', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue({
      refreshToken: 'old-refresh-token',
      tokenEndpoint: 'https://issuer.example/token',
      credentialConfigurationId: 'employee_card',
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        access_token: 'new-access-token',
        refresh_token: 'rotated-refresh-token',
      }),
    })

    await refreshAccessToken({
      logger: logger as any,
      cred: credential as any,
      agentContext: agentContext as any,
    })

    expect(mockSetRefreshCredentialMetadata).toHaveBeenCalledWith(credential, {
      refreshToken: 'rotated-refresh-token',
      tokenEndpoint: 'https://issuer.example/token',
      credentialConfigurationId: 'employee_card',
    })
    expect(mockPersistCredentialRecord).toHaveBeenCalledWith(agentContext, credential)
  })

  test('throws when the token endpoint responds with an error', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenEndpoint: 'https://issuer.example/token',
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('bad request'),
    })

    await expect(
      refreshAccessToken({
        logger: logger as any,
        cred: credential as any,
        agentContext: agentContext as any,
      })
    ).rejects.toThrow('Refresh failed 400: bad request')
  })
})
