import { ClaimFormat } from '@credo-ts/core'
import {
  formatDcqlCredentialsForRequest,
  formatDifPexCredentialsForRequest,
  formatOpenIdProofRequest,
} from '../../../src/modules/openid/displayProof'
import { filterAndMapSdJwtKeys, getCredentialForDisplay } from '../../../src/modules/openid/display'
import { beforeEach, describe, expect, jest, test } from '@jest/globals'

jest.mock('../../../src/modules/openid/display', () => ({
  filterAndMapSdJwtKeys: require('@jest/globals').jest.fn(),
  getCredentialForDisplay: require('@jest/globals').jest.fn(),
}))

const mockFilterAndMapSdJwtKeys = filterAndMapSdJwtKeys as jest.Mock
const mockGetCredentialForDisplay = getCredentialForDisplay as jest.Mock

describe('formatDifPexCredentialsForRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('formats generic, sd-jwt, and mdoc submissions for display', () => {
    mockGetCredentialForDisplay
      .mockReturnValueOnce({
        display: {
          name: 'Employee Card',
          issuer: { name: 'Issuer Inc.' },
          backgroundColor: '#123456',
          textColor: '#ffffff',
          backgroundImage: { uri: 'https://example.com/bg.png' },
        },
        attributes: { employeeId: '1234' },
        metadata: { type: 'EmployeeCard' },
        claimFormat: ClaimFormat.JwtVc,
      })
      .mockReturnValueOnce({
        display: {
          name: 'Mobile Credential',
          issuer: { name: 'Issuer Inc.' },
        },
        attributes: { hidden: true },
        metadata: { type: 'MobileCredential' },
        claimFormat: ClaimFormat.SdJwtW3cVc,
      })
      .mockReturnValueOnce({
        display: {
          name: 'Driving Privilege',
          issuer: { name: 'DMV' },
        },
        attributes: { family_name: 'Doe' },
        metadata: { type: 'org.iso.18013.5.1.mDL' },
        claimFormat: ClaimFormat.MsoMdoc,
      })

    mockFilterAndMapSdJwtKeys.mockReturnValue({
      visibleProperties: {
        given_name: 'Ada',
      },
    })

    const result = formatDifPexCredentialsForRequest({
      purpose: 'Proof your entitlement',
      requirements: [
        {
          submissionEntry: [
            {
              inputDescriptorId: 'descriptor-generic',
              name: 'Employment',
              purpose: 'Show your employee credential',
              verifiableCredentials: [
                {
                  claimFormat: ClaimFormat.JwtVc,
                  credentialRecord: { id: 'cred-1' },
                  disclosedPayload: {},
                },
              ],
            },
            {
              inputDescriptorId: 'descriptor-sd-jwt',
              purpose: 'Show only the requested claims',
              verifiableCredentials: [
                {
                  claimFormat: ClaimFormat.SdJwtDc,
                  credentialRecord: { id: 'cred-2' },
                  disclosedPayload: { given_name: 'Ada' },
                },
              ],
            },
            {
              inputDescriptorId: 'descriptor-mdoc',
              name: 'Mobile Driving Licence',
              verifiableCredentials: [
                {
                  claimFormat: ClaimFormat.MsoMdoc,
                  credentialRecord: { id: 'cred-3' },
                  disclosedPayload: {
                    org_iso_18013_5_1: { family_name: 'Doe' },
                    org_example: { age_over_18: true },
                  },
                },
              ],
            },
            {
              inputDescriptorId: 'descriptor-empty',
              verifiableCredentials: [],
            },
          ],
        },
      ],
    } as any)

    expect(result.name).toBe('Unknown')
    expect(result.purpose).toBe('Proof your entitlement')
    expect(result.areAllSatisfied).toBe(false)
    expect(result.entries).toHaveLength(4)

    expect(result.entries[0]).toMatchObject({
      inputDescriptorId: 'descriptor-generic',
      name: 'Employment',
      purpose: 'Show your employee credential',
      description: 'Show your employee credential',
      isSatisfied: true,
    })
    expect(result.entries[0]?.credentials[0]).toEqual({
      id: 'cred-1',
      credentialName: 'Employee Card',
      issuerName: 'Issuer Inc.',
      requestedAttributes: ['employeeId'],
      metadata: { type: 'EmployeeCard' },
      backgroundColor: '#123456',
      textColor: '#ffffff',
      backgroundImage: { uri: 'https://example.com/bg.png' },
      claimFormat: ClaimFormat.JwtVc,
    })

    expect(result.entries[1]).toMatchObject({
      inputDescriptorId: 'descriptor-sd-jwt',
      name: 'Unknown',
      isSatisfied: true,
    })
    expect(result.entries[1]?.credentials[0]?.requestedAttributes).toEqual(['given_name'])

    expect(result.entries[2]?.credentials[0]?.requestedAttributes).toEqual(['family_name', 'age_over_18'])

    expect(result.entries[3]).toEqual({
      inputDescriptorId: 'descriptor-empty',
      name: 'Unknown',
      purpose: undefined,
      description: undefined,
      isSatisfied: false,
      credentials: [],
    })
  })
})

describe('formatDcqlCredentialsForRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('formats satisfied dcql credentials including sd-jwt and mdoc claim handling', () => {
    mockGetCredentialForDisplay
      .mockReturnValueOnce({
        display: {
          name: 'Mobile Employee',
          issuer: { name: 'Issuer Inc.' },
          backgroundColor: '#111111',
          textColor: '#ffffff',
        },
        metadata: { type: 'EmployeeCredential' },
      })
      .mockReturnValueOnce({
        display: {
          name: 'Mobile Driver Licence',
          issuer: { name: 'DMV' },
          backgroundImage: { uri: 'https://example.com/mdoc.png' },
        },
        metadata: { type: 'org.iso.18013.5.1.mDL' },
      })

    mockFilterAndMapSdJwtKeys.mockReturnValue({
      visibleProperties: {
        given_name: 'Ada',
        family_name: 'Lovelace',
      },
    })

    const result = formatDcqlCredentialsForRequest({
      can_be_satisfied: true,
      credentials: [
        {
          id: 'query-sdjwt',
          format: 'vc+sd-jwt',
          meta: { vct_values: ['https://example.com/EmployeeCredential'] },
          claims: [{ path: ['given_name'] }, { path: ['family_name'] }],
        },
        {
          id: 'query-mdoc',
          format: 'mso_mdoc',
          meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
          claims: [
            { path: ['org.iso.18013.5.1', 'family_name'] },
            { namespace: 'org.iso.18013.5.1', claim_name: 'given_name' },
          ],
        },
      ],
      credential_matches: {
        'query-sdjwt': {
          success: true,
          valid_credentials: [
            {
              record: { id: 'cred-sdjwt', type: 'SdJwtVcRecord' },
              claims: {
                valid_claim_sets: [
                  {
                    output: {
                      given_name: 'Ada',
                      family_name: 'Lovelace',
                    },
                  },
                ],
              },
            },
          ],
        },
        'query-mdoc': {
          success: true,
          valid_credentials: [
            {
              record: { id: 'cred-mdoc', type: 'MdocRecord' },
              claims: {
                valid_claim_sets: [
                  {
                    output: {
                      org_iso_18013_5_1: {
                        family_name: 'Doe',
                        given_name: 'John',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      credential_sets: [
        {
          required: true,
          purpose: 'Prove entitlement',
          options: [['query-sdjwt', 'query-mdoc']],
          matching_options: [['query-sdjwt', 'query-mdoc']],
        },
      ],
    } as any)

    expect(result).toMatchObject({
      name: 'Unknown',
      purpose: 'Prove entitlement',
      areAllSatisfied: true,
    })

    expect(result.entries[0]).toEqual({
      inputDescriptorId: 'query-sdjwt',
      name: 'query-sdjwt',
      purpose: 'Prove entitlement',
      description: undefined,
      isSatisfied: true,
      credentials: [
        {
          id: 'cred-sdjwt',
          credentialName: 'Mobile Employee',
          issuerName: 'Issuer Inc.',
          requestedAttributes: ['given_name', 'family_name'],
          metadata: { type: 'EmployeeCredential' },
          backgroundColor: '#111111',
          textColor: '#ffffff',
          backgroundImage: undefined,
          claimFormat: ClaimFormat.SdJwtDc,
        },
      ],
    })

    expect(result.entries[1]).toEqual({
      inputDescriptorId: 'query-mdoc',
      name: 'query-mdoc',
      purpose: 'Prove entitlement',
      description: undefined,
      isSatisfied: true,
      credentials: [
        {
          id: 'cred-mdoc',
          credentialName: 'Mobile Driver Licence',
          issuerName: 'DMV',
          requestedAttributes: ['family_name', 'given_name'],
          metadata: { type: 'org.iso.18013.5.1.mDL' },
          backgroundColor: undefined,
          textColor: undefined,
          backgroundImage: { uri: 'https://example.com/mdoc.png' },
          claimFormat: ClaimFormat.MsoMdoc,
        },
      ],
    })
  })

  test('creates an unsatisfied placeholder entry when no valid dcql credentials exist', () => {
    const result = formatDcqlCredentialsForRequest({
      can_be_satisfied: false,
      credentials: [
        {
          id: 'query-jwt',
          format: 'jwt_vc_json',
          claims: [{ path: ['employee', 'id'] }],
        },
      ],
      credential_matches: {
        'query-jwt': {
          success: false,
        },
      },
    } as any)

    expect(result).toEqual({
      name: 'Unknown',
      purpose: undefined,
      areAllSatisfied: false,
      entries: [
        {
          inputDescriptorId: 'query-jwt',
          name: 'query-jwt',
          purpose: undefined,
          description: undefined,
          isSatisfied: false,
          credentials: [
            {
              id: 'query-jwt',
              credentialName: 'query-jwt',
              requestedAttributes: ['employee.id'],
              claimFormat: ClaimFormat.JwtVc,
            },
          ],
        },
      ],
    })
  })
})

describe('formatOpenIdProofRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('routes to pex, dcql, or undefined depending on the request record shape', () => {
    mockGetCredentialForDisplay.mockReturnValue({
      display: {
        name: 'Employee Card',
        issuer: { name: 'Issuer Inc.' },
      },
      attributes: { employeeId: '1234' },
      metadata: { type: 'EmployeeCard' },
      claimFormat: ClaimFormat.JwtVc,
    })

    const pexResult = formatOpenIdProofRequest({
      presentationExchange: {
        credentialsForRequest: {
          requirements: [
            {
              submissionEntry: [
                {
                  inputDescriptorId: 'descriptor-1',
                  verifiableCredentials: [
                    {
                      claimFormat: ClaimFormat.JwtVc,
                      credentialRecord: { id: 'cred-1' },
                      disclosedPayload: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    } as any)

    const dcqlResult = formatOpenIdProofRequest({
      dcql: {
        queryResult: {
          can_be_satisfied: false,
          credentials: [{ id: 'query-1', format: 'jwt_vc_json', claims: [] }],
          credential_matches: {
            'query-1': { success: false },
          },
        },
      },
    } as any)

    const emptyResult = formatOpenIdProofRequest({} as any)

    expect(pexResult?.entries[0]?.inputDescriptorId).toBe('descriptor-1')
    expect(dcqlResult?.entries[0]?.inputDescriptorId).toBe('query-1')
    expect(emptyResult).toBeUndefined()
  })
})
