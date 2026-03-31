import { getCredentialsForProofRequest } from '../../../src/modules/openid/resolverProof'

describe('getCredentialsForProofRequest', () => {
  test('forwards a raw authorization request string unchanged', async () => {
    const request = 'eyJhbGciOiJFZERTQSJ9.eyJyZXNwb25zZV91cmkiOiJodHRwczovL3ZlcmlmaWVyLmV4YW1wbGUuY29tL2NhbGxiYWNrIn0.signature'
    const resolveOpenId4VpAuthorizationRequest = jest.fn().mockResolvedValue({
      presentationExchange: {
        definition: { id: 'definition-id', input_descriptors: [] },
        credentialsForRequest: undefined,
      },
      authorizationRequestPayload: {
        response_uri: 'https://verifier.example.com/callback',
      },
      verifier: {
        clientIdPrefix: 'redirect_uri',
        effectiveClientId: 'https://verifier.example.com/callback',
      },
    })

    const agent = {
      config: {
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      },
      modules: {
        openid4vc: {
          holder: {
            resolveOpenId4VpAuthorizationRequest,
          },
        },
      },
    }

    await getCredentialsForProofRequest({
      agent: agent as any,
      request,
    })

    expect(resolveOpenId4VpAuthorizationRequest).toHaveBeenCalledWith(request)
  })
})
