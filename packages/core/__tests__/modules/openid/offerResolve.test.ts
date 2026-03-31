import { DidJwk, DidKey, Kms } from '@credo-ts/core'
import { OpenId4VciCredentialFormatProfile } from '@credo-ts/openid4vc'
import { customCredentialBindingResolver } from '../../../src/modules/openid/offerResolve'

const rawPublicJwk = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: '11qYAY7RNVc6M_H1dC0vtwQb4X3h6lVvY8f1QmV9H6A',
}

const publicJwk = Kms.PublicJwk.fromUnknown(rawPublicJwk)

const createAgentMock = () => ({
  kms: {
    createKeyForSignatureAlgorithm: jest.fn().mockResolvedValue({
      keyId: 'test-key-id',
      publicJwk: rawPublicJwk,
    }),
  },
  dids: {
    create: jest.fn(),
  },
})

const proofTypes = {
  jwt: {
    supportedSignatureAlgorithms: ['EdDSA'],
  },
}

describe('customCredentialBindingResolver', () => {
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
})
