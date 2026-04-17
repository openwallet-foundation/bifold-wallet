import { DidJwk, DidKey, Kms } from '@credo-ts/core'
import { OpenId4VciCredentialFormatProfile } from '@credo-ts/openid4vc'
import {
  acquirePreAuthorizedAccessToken,
  customCredentialBindingResolver,
  receiveCredentialFromOpenId4VciOffer,
  resolveOpenId4VciOffer,
} from '../../../src/modules/openid/offerResolve'
import {
  extractOpenId4VcCredentialMetadata,
  setOpenId4VcCredentialMetadata,
} from '../../../src/modules/openid/metadata'

jest.mock('../../../src/modules/openid/metadata', () => ({
  extractOpenId4VcCredentialMetadata: jest.fn(),
  setOpenId4VcCredentialMetadata: jest.fn(),
}))

const rawPublicJwk = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '11qYAY7RNVc6M_H1dC0vtwQb4X3h6lVvY8f1QmV9H6A',
}

const publicJwk = Kms.PublicJwk.fromUnknown(rawPublicJwk)

const createAgentMock = () => ({
  config: {
    logger: {
      info: jest.fn(),
    },
  },
  kms: {
    createKeyForSignatureAlgorithm: jest.fn().mockResolvedValue({
      keyId: 'test-key-id',
      publicJwk: rawPublicJwk,
    }),
  },
  dids: {
    create: jest.fn(),
  },
  openid4vc: {
    holder: {
      resolveCredentialOffer: jest.fn(),
      requestToken: jest.fn(),
      requestCredentials: jest.fn(),
    },
  },
})

const proofTypes = {
  jwt: {
    supportedSignatureAlgorithms: ['EdDSA'],
  },
}

describe('customCredentialBindingResolver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('resolves an offer from parsed data by reconstructing an openid offer uri', async () => {
    const agent = createAgentMock()
    const resolvedOffer = { id: 'resolved-offer' }
    const data = { credential_issuer: 'https://issuer.example' }

    agent.openid4vc.holder.resolveCredentialOffer.mockResolvedValue(resolvedOffer)

    await expect(resolveOpenId4VciOffer({ agent: agent as any, data })).resolves.toBe(resolvedOffer)

    expect(agent.openid4vc.holder.resolveCredentialOffer).toHaveBeenCalledWith(
      `openid-credential-offer://credential_offer=${encodeURIComponent(JSON.stringify(data))}`
    )
    expect(agent.config.logger.info).toHaveBeenCalled()
  })

  test('throws when offer resolution is called without data or uri', async () => {
    const agent = createAgentMock()

    await expect(resolveOpenId4VciOffer({ agent: agent as any })).rejects.toThrow('either data or uri must be provided')
  })

  test('throws when authorization code flow is requested', async () => {
    const agent = createAgentMock()

    agent.openid4vc.holder.resolveCredentialOffer.mockResolvedValue({ id: 'resolved-offer' })

    await expect(
      resolveOpenId4VciOffer({
        agent: agent as any,
        uri: 'openid-credential-offer://credential_offer=%7B%7D',
        authorization: {
          clientId: 'client-id',
          redirectUri: 'https://wallet.example/callback',
        },
      })
    ).rejects.toThrow('Authorization code flow is not implemented in this OpenID credential offer flow.')
  })

  test('acquires a pre-authorized access token with the provided tx code', async () => {
    const agent = createAgentMock()
    const resolvedCredentialOffer = { id: 'resolved-offer' }
    const tokenResponse = { accessToken: 'token' }

    agent.openid4vc.holder.requestToken.mockResolvedValue(tokenResponse)

    await expect(
      acquirePreAuthorizedAccessToken({
        agent: agent as any,
        resolvedCredentialOffer: resolvedCredentialOffer as any,
        txCode: '123456',
      })
    ).resolves.toBe(tokenResponse)

    expect(agent.openid4vc.holder.requestToken).toHaveBeenCalledWith({
      resolvedCredentialOffer,
      txCode: '123456',
    })
  })

  test('prefers did:jwk when both did:jwk and did:key are supported', async () => {
    const agent = createAgentMock()
    const didJwk = DidJwk.fromPublicJwk(publicJwk)

    agent.dids.create.mockResolvedValue({
      didState: {
        state: 'finished',
        did: didJwk.did,
      },
    })

    const result = await customCredentialBindingResolver({
      agent: agent as any,
      supportedDidMethods: ['did:key', 'did:jwk'],
      supportsAllDidMethods: false,
      supportsJwk: false,
      credentialFormat: OpenId4VciCredentialFormatProfile.JwtVcJson,
      proofTypes: proofTypes as any,
    })

    expect(agent.dids.create).toHaveBeenCalledWith({
      method: 'jwk',
      options: { keyId: 'test-key-id' },
    })
    expect(result).toEqual({
      method: 'did',
      didUrls: [didJwk.verificationMethodId],
    })
  })

  test('falls back to did:key when supported did methods are missing and plain jwk is not supported', async () => {
    const agent = createAgentMock()
    const didKey = new DidKey(publicJwk)

    agent.dids.create.mockResolvedValue({
      didState: {
        state: 'finished',
        did: didKey.did,
      },
    })

    const result = await customCredentialBindingResolver({
      agent: agent as any,
      supportedDidMethods: undefined,
      supportsAllDidMethods: false,
      supportsJwk: false,
      credentialFormat: OpenId4VciCredentialFormatProfile.JwtVcJson,
      proofTypes: proofTypes as any,
    })

    expect(agent.dids.create).toHaveBeenCalledWith({
      method: 'key',
      options: { keyId: 'test-key-id' },
    })
    expect(result).toEqual({
      method: 'did',
      didUrls: [`${didKey.did}#${didKey.publicJwk.fingerprint}`],
    })
  })

  test('throws when did creation does not finish successfully', async () => {
    const agent = createAgentMock()

    agent.dids.create.mockResolvedValue({
      didState: {
        state: 'failed',
        reason: 'unknownError: failed',
      },
    })

    await expect(
      customCredentialBindingResolver({
        agent: agent as any,
        supportedDidMethods: ['did:jwk'],
        supportsAllDidMethods: false,
        supportsJwk: false,
        credentialFormat: OpenId4VciCredentialFormatProfile.JwtVcJson,
        proofTypes: proofTypes as any,
      })
    ).rejects.toThrow('DID creation failed.')
  })

  test('returns a plain jwk binding for sd-jwt credentials when only jwk is supported', async () => {
    const agent = createAgentMock()

    const result = await customCredentialBindingResolver({
      agent: agent as any,
      supportedDidMethods: [],
      supportsAllDidMethods: false,
      supportsJwk: true,
      credentialFormat: OpenId4VciCredentialFormatProfile.SdJwtVc,
      proofTypes: proofTypes as any,
    })

    expect(agent.dids.create).not.toHaveBeenCalled()
    expect(result).toEqual({
      method: 'jwk',
      keys: [publicJwk],
    })
  })

  test('throws when no supported binding method can be found', async () => {
    const agent = createAgentMock()

    await expect(
      customCredentialBindingResolver({
        agent: agent as any,
        supportedDidMethods: [],
        supportsAllDidMethods: false,
        supportsJwk: true,
        credentialFormat: OpenId4VciCredentialFormatProfile.JwtVcJson,
        proofTypes: proofTypes as any,
      })
    ).rejects.toThrow('No supported binding method could be found.')
  })

  test('receives a credential and stores extracted OpenID metadata on the record', async () => {
    const agent = createAgentMock()
    const record = { id: 'record-1' }
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
    const tokenResponse = { accessToken: 'token' }
    const extractedMetadata = { credential: {}, issuer: { id: 'https://issuer.example' } }

    ;(extractOpenId4VcCredentialMetadata as jest.Mock).mockReturnValue(extractedMetadata)
    agent.openid4vc.holder.requestCredentials.mockResolvedValue({
      credentials: [{ record }],
    })

    await expect(
      receiveCredentialFromOpenId4VciOffer({
        agent: agent as any,
        resolvedCredentialOffer: resolvedCredentialOffer as any,
        tokenResponse: tokenResponse as any,
        clientId: 'wallet-client',
      })
    ).resolves.toBe(record)

    expect(agent.openid4vc.holder.requestCredentials).toHaveBeenCalledWith(
      expect.objectContaining({
        resolvedCredentialOffer,
        accessToken: 'token',
        clientId: 'wallet-client',
        credentialConfigurationIds: ['employee_card'],
        verifyCredentialStatus: false,
        allowedProofOfPossessionSignatureAlgorithms: ['EdDSA', 'ES256'],
        credentialBindingResolver: expect.any(Function),
      })
    )
    expect(extractOpenId4VcCredentialMetadata).toHaveBeenCalledWith(
      resolvedCredentialOffer.offeredCredentialConfigurations.employee_card,
      {
        id: 'https://issuer.example',
        display: [{ name: 'Issuer Example' }],
      }
    )
    expect(setOpenId4VcCredentialMetadata).toHaveBeenCalledWith(record, extractedMetadata)
  })

  test('throws when the requested credential configuration id does not exist in the offer', async () => {
    const agent = createAgentMock()
    const resolvedCredentialOffer = {
      offeredCredentialConfigurations: {
        employee_card: {},
      },
      metadata: {
        credentialIssuer: {
          credential_issuer: 'https://issuer.example',
        },
      },
    }

    await expect(
      receiveCredentialFromOpenId4VciOffer({
        agent: agent as any,
        resolvedCredentialOffer: resolvedCredentialOffer as any,
        tokenResponse: { accessToken: 'token' } as any,
        credentialConfigurationIdsToRequest: ['missing'],
      })
    ).rejects.toThrow("is not a credential_configuration_id in the credential offer")
  })

  test('throws when the credential response does not include a first credential record', async () => {
    const agent = createAgentMock()
    const resolvedCredentialOffer = {
      offeredCredentialConfigurations: {
        employee_card: {},
      },
      metadata: {
        credentialIssuer: {
          credential_issuer: 'https://issuer.example',
        },
      },
    }

    agent.openid4vc.holder.requestCredentials.mockResolvedValue({
      credentials: [],
    })

    await expect(
      receiveCredentialFromOpenId4VciOffer({
        agent: agent as any,
        resolvedCredentialOffer: resolvedCredentialOffer as any,
        tokenResponse: { accessToken: 'token' } as any,
      })
    ).rejects.toThrow('firstCredential undefined')
  })

  test('throws when the first credential is returned as a string', async () => {
    const agent = createAgentMock()
    const resolvedCredentialOffer = {
      offeredCredentialConfigurations: {
        employee_card: {},
      },
      metadata: {
        credentialIssuer: {
          credential_issuer: 'https://issuer.example',
        },
      },
    }

    agent.openid4vc.holder.requestCredentials.mockResolvedValue({
      credentials: ['credential-jwt'],
    })

    await expect(
      receiveCredentialFromOpenId4VciOffer({
        agent: agent as any,
        resolvedCredentialOffer: resolvedCredentialOffer as any,
        tokenResponse: { accessToken: 'token' } as any,
      })
    ).rejects.toThrow('firstCredential is string')
  })
})
