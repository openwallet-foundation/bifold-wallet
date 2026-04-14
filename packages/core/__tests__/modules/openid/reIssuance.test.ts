import { reissueCredentialWithAccessToken } from '../../../src/modules/openid/refresh/reIssuance'
import {
  extractOpenId4VcCredentialMetadata,
  getRefreshCredentialMetadata,
  setOpenId4VcCredentialMetadata,
  setRefreshCredentialMetadata,
} from '../../../src/modules/openid/metadata'
import { customCredentialBindingResolver } from '../../../src/modules/openid/offerResolve'

jest.mock('../../../src/modules/openid/metadata', () => ({
  extractOpenId4VcCredentialMetadata: jest.fn(),
  getRefreshCredentialMetadata: jest.fn(),
  setOpenId4VcCredentialMetadata: jest.fn(),
  setRefreshCredentialMetadata: jest.fn(),
}))

jest.mock('../../../src/modules/openid/offerResolve', () => ({
  customCredentialBindingResolver: jest.fn(),
}))

const mockExtractOpenId4VcCredentialMetadata = extractOpenId4VcCredentialMetadata as jest.Mock
const mockGetRefreshCredentialMetadata = getRefreshCredentialMetadata as jest.Mock
const mockSetOpenId4VcCredentialMetadata = setOpenId4VcCredentialMetadata as jest.Mock
const mockSetRefreshCredentialMetadata = setRefreshCredentialMetadata as jest.Mock
const mockCustomCredentialBindingResolver = customCredentialBindingResolver as jest.Mock

describe('reissueCredentialWithAccessToken', () => {
  const logger = {
    info: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCustomCredentialBindingResolver.mockResolvedValue({
      method: 'did',
      didUrls: ['did:key:test#key-1'],
    })
  })

  test('throws when no record is provided', async () => {
    await expect(
      reissueCredentialWithAccessToken({
        agent: {} as any,
        logger: logger as any,
        record: undefined,
        tokenResponse: { access_token: 'access-token' },
      })
    ).rejects.toThrow('No credential record provided for re-issuance.')
  })

  test('throws when refresh metadata is missing', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue(undefined)

    await expect(
      reissueCredentialWithAccessToken({
        agent: {} as any,
        logger: logger as any,
        record: { id: 'cred-1' } as any,
        tokenResponse: { access_token: 'access-token' },
      })
    ).rejects.toThrow('No refresh metadata found on the record for re-issuance.')
  })

  test('throws when refresh metadata does not contain a resolved offer', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue({
      credentialConfigurationId: 'employee_card',
    })

    await expect(
      reissueCredentialWithAccessToken({
        agent: {} as any,
        logger: logger as any,
        record: { id: 'cred-1' } as any,
        tokenResponse: { access_token: 'access-token' },
      })
    ).rejects.toThrow('No resolved credential offer found in the refresh metadata for re-issuance.')
  })

  test('throws when the token response is missing an access token', async () => {
    mockGetRefreshCredentialMetadata.mockReturnValue({
      credentialConfigurationId: 'employee_card',
      resolvedCredentialOffer: {
        offeredCredentialConfigurations: { employee_card: {} },
      },
    })

    await expect(
      reissueCredentialWithAccessToken({
        agent: {} as any,
        logger: logger as any,
        record: { id: 'cred-1' } as any,
        tokenResponse: { access_token: '' },
      })
    ).rejects.toThrow('No access token found in the token response for re-issuance.')
  })

  test('requests a new credential and copies OpenID refresh metadata onto the new record', async () => {
    const newRecord = { id: 'new-cred-1' }
    const resolvedCredentialOffer = {
      offeredCredentialConfigurations: {
        employee_card: {
          display: [{ name: 'Employee Card' }],
        },
      },
      metadata: {
        credentialIssuer: {
          credential_issuer: 'https://issuer.example',
          display: [{ name: 'Issuer Example' }],
        },
      },
    }
    const refreshMetaData = {
      credentialConfigurationId: 'employee_card',
      refreshToken: 'old-refresh-token',
      resolvedCredentialOffer,
    }
    const agent = {
      openid4vc: {
        holder: {
          requestCredentials: jest.fn().mockResolvedValue({
            credentials: [{ record: newRecord }],
          }),
        },
      },
    }

    mockGetRefreshCredentialMetadata.mockReturnValue(refreshMetaData)
    mockExtractOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: { id: 'https://issuer.example' },
      credential: {},
    })

    const result = await reissueCredentialWithAccessToken({
      agent: agent as any,
      logger: logger as any,
      record: { id: 'cred-1' } as any,
      tokenResponse: {
        access_token: 'access-token',
        token_type: 'DPoP',
        c_nonce: 'nonce',
        refresh_token: 'new-refresh-token',
      },
      clientId: 'wallet-client',
    })

    expect(agent.openid4vc.holder.requestCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        resolvedCredentialOffer,
        accessToken: 'access-token',
        tokenType: 'DPoP',
        cNonce: 'nonce',
        clientId: 'wallet-client',
        credentialConfigurationIds: ['employee_card'],
        verifyCredentialStatus: false,
        allowedProofOfPossessionSignatureAlgorithms: ['EdDSA', 'ES256'],
        credentialBindingResolver: expect.any(Function),
      })
    )
    expect(mockExtractOpenId4VcCredentialMetadata).toHaveBeenCalledWith(
      resolvedCredentialOffer.offeredCredentialConfigurations.employee_card,
      {
        id: 'https://issuer.example',
        display: [{ name: 'Issuer Example' }],
      }
    )
    expect(mockSetOpenId4VcCredentialMetadata).toHaveBeenCalled()
    expect(mockSetRefreshCredentialMetadata).toHaveBeenCalledWith(
      newRecord,
      expect.objectContaining({
        credentialConfigurationId: 'employee_card',
        refreshToken: 'new-refresh-token',
        lastCheckResult: 'valid',
      })
    )
    expect(result).toBe(newRecord)
  })

  test('throws when the issuer returns an empty or malformed credential response', async () => {
    const agent = {
      openid4vc: {
        holder: {
          requestCredentials: jest.fn().mockResolvedValue({
            credentials: ['compact-jwt'],
          }),
        },
      },
    }

    mockGetRefreshCredentialMetadata.mockReturnValue({
      credentialConfigurationId: 'employee_card',
      refreshToken: 'old-refresh-token',
      resolvedCredentialOffer: {
        offeredCredentialConfigurations: { employee_card: {} },
        metadata: {
          credentialIssuer: {
            credential_issuer: 'https://issuer.example',
          },
        },
      },
    })

    await expect(
      reissueCredentialWithAccessToken({
        agent: agent as any,
        logger: logger as any,
        record: { id: 'cred-1' } as any,
        tokenResponse: { access_token: 'access-token' },
      })
    ).rejects.toThrow('Issuer returned empty or malformed credential on re-issuance.')
  })
})
