import { Linking } from 'react-native'
import { getCredentialsForProofRequest, shareProof } from '../../../src/modules/openid/resolverProof'

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
}))

describe('getCredentialsForProofRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  test('returns a request record with verifier hostname extracted from response_uri', async () => {
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

    const result = await getCredentialsForProofRequest({
      agent: agent as any,
      request: 'eyJhbGciOiJFZERTQSJ9.payload.signature',
    })

    expect(result?.verifierHostName).toBe('verifier.example.com')
    expect(result?.type).toBe('OpenId4VPRequestRecord')
  })

  test('logs and rethrows when the authorization request has neither pex nor dcql payload', async () => {
    const resolveOpenId4VpAuthorizationRequest = jest.fn().mockResolvedValue({
      presentationExchange: undefined,
      dcql: undefined,
      authorizationRequestPayload: {},
      verifier: {
        clientIdPrefix: 'redirect_uri',
        effectiveClientId: 'https://verifier.example.com/callback',
      },
    })
    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    }
    const agent = {
      config: { logger },
      modules: {
        openid4vc: {
          holder: {
            resolveOpenId4VpAuthorizationRequest,
          },
        },
      },
    }

    await expect(
      getCredentialsForProofRequest({
        agent: agent as any,
        request: 'eyJhbGciOiJFZERTQSJ9.payload.signature',
      })
    ).rejects.toThrow('Unsupported authorization request: missing presentation exchange or dcql parameters.')

    expect(logger.error).toHaveBeenCalledWith(
      'Parsing presentation request:  Unsupported authorization request: missing presentation exchange or dcql parameters.'
    )
  })

  test('shares a pex proof with the selected credential and opens redirect_uri when returned', async () => {
    const credentialA = { id: 'cred-a' }
    const credentialB = { id: 'cred-b' }
    const acceptOpenId4VpAuthorizationRequest = jest.fn().mockResolvedValue({
      serverResponse: {
        status: 200,
        body: {
          redirect_uri: 'https://wallet.example/complete',
        },
      },
    })
    const agent = {
      openid4vc: {
        holder: {
          acceptOpenId4VpAuthorizationRequest,
        },
      },
    }
    const requestRecord = {
      authorizationRequestPayload: { client_id: 'verifier' },
      origin: 'https://verifier.example.com',
      presentationExchange: {
        credentialsForRequest: {
          areRequirementsSatisfied: true,
          requirements: [
            {
              submissionEntry: [
                {
                  inputDescriptorId: 'descriptor-1',
                  verifiableCredentials: [{ credentialRecord: credentialA }, { credentialRecord: credentialB }],
                },
              ],
            },
          ],
        },
      },
    }

    await shareProof({
      agent: agent as any,
      requestRecord: requestRecord as any,
      selectedProofCredentials: {
        'descriptor-1': {
          id: 'cred-b',
          claimFormat: 'jwt_vc_json',
        },
      },
    })

    expect(acceptOpenId4VpAuthorizationRequest).toHaveBeenCalledWith({
      authorizationRequestPayload: { client_id: 'verifier' },
      presentationExchange: {
        credentials: {
          'descriptor-1': [{ credentialRecord: credentialB }],
        },
      },
      dcql: undefined,
      origin: 'https://verifier.example.com',
    })
    expect(Linking.openURL).toHaveBeenCalledWith('https://wallet.example/complete')
  })

  test('falls back to credo dcql selection when no credential is preselected', async () => {
    const selectCredentialsForDcqlRequest = jest.fn().mockReturnValue({
      queryA: [
        {
          credentialRecord: { id: 'cred-a' },
          claimFormat: 'dcql',
        },
      ],
    })
    const acceptOpenId4VpAuthorizationRequest = jest.fn().mockResolvedValue({
      serverResponse: {
        status: 200,
        body: 'ok',
      },
    })
    const agent = {
      openid4vc: {
        holder: {
          selectCredentialsForDcqlRequest,
          acceptOpenId4VpAuthorizationRequest,
        },
      },
    }
    const requestRecord = {
      authorizationRequestPayload: { client_id: 'verifier' },
      origin: 'https://verifier.example.com',
      dcql: {
        queryResult: {
          can_be_satisfied: true,
        },
      },
    }

    await shareProof({
      agent: agent as any,
      requestRecord: requestRecord as any,
      selectedProofCredentials: {},
    })

    expect(selectCredentialsForDcqlRequest).toHaveBeenCalledWith(requestRecord.dcql.queryResult)
    expect(acceptOpenId4VpAuthorizationRequest).toHaveBeenCalledWith({
      authorizationRequestPayload: { client_id: 'verifier' },
      presentationExchange: undefined,
      dcql: {
        credentials: {
          queryA: [
            {
              credentialRecord: { id: 'cred-a' },
              claimFormat: 'dcql',
            },
          ],
        },
      },
      origin: 'https://verifier.example.com',
    })
  })

  test('throws before submission when proof requirements are not satisfied', async () => {
    await expect(
      shareProof({
        agent: {} as any,
        requestRecord: {
          presentationExchange: {
            credentialsForRequest: {
              areRequirementsSatisfied: false,
              requirements: [],
            },
          },
        } as any,
        selectedProofCredentials: {},
      })
    ).rejects.toThrow('Requirements from proof request are not satisfied')
  })

  test('wraps submission errors from the verifier response', async () => {
    const acceptOpenId4VpAuthorizationRequest = jest.fn().mockResolvedValue({
      serverResponse: {
        status: 400,
        body: 'Verifier rejected proof',
      },
    })

    await expect(
      shareProof({
        agent: {
          openid4vc: {
            holder: {
              acceptOpenId4VpAuthorizationRequest,
            },
          },
        } as any,
        requestRecord: {
          authorizationRequestPayload: { client_id: 'verifier' },
          origin: 'https://verifier.example.com',
          presentationExchange: {
            credentialsForRequest: {
              areRequirementsSatisfied: true,
              requirements: [
                {
                  submissionEntry: [
                    {
                      inputDescriptorId: 'descriptor-1',
                      verifiableCredentials: [{ credentialRecord: { id: 'cred-a' } }],
                    },
                  ],
                },
              ],
            },
          },
        } as any,
        selectedProofCredentials: {
          'descriptor-1': {
            id: 'cred-a',
            claimFormat: 'jwt_vc_json',
          },
        },
      })
    ).rejects.toThrow('Error accepting proof request. Error while accepting authorization request. Verifier rejected proof')
  })
})
