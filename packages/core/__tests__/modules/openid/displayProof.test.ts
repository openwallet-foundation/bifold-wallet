import { ClaimFormat } from '@credo-ts/core'
import { formatDifPexCredentialsForRequest } from '../../../src/modules/openid/displayProof'
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
