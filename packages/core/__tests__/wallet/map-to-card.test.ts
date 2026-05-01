import { W3cCredentialRecord } from '@credo-ts/core'
import { BrandingOverlayType } from '@bifold/oca/build/legacy'
import { getCredentialForDisplay } from '../../src/modules/openid/display'
import { mapCredentialTypeToCard, mapW3CToCard } from '../../src/wallet/map-to-card'

jest.mock('../../src/modules/openid/display', () => ({
  getCredentialForDisplay: jest.fn(),
}))

const mockGetCredentialForDisplay = getCredentialForDisplay as jest.Mock

describe('mapW3CToCard', () => {
  const input = {
    vc: {
      issuer: { name: 'Issuer Inc.' },
      type: ['VerifiableCredential', 'EmployeeCredential'],
      credentialSubject: {
        givenName: 'Ada',
        familyName: 'Lovelace',
        birthDate: '1815-12-10',
      },
      name: 'Employee Credential',
    },
    branding: {
      type: 'Branding10' as const,
      primaryBg: '#ffffff',
    },
    labels: {
      givenName: 'Given Name',
      birthDate: 'Date of Birth',
    },
    formats: {
      birthDate: 'date' as const,
    },
    piiKeys: ['birthDate'],
  }

  test('uses requested display items for W3C proof cards', () => {
    const result = mapW3CToCard(input, 'credential-id', {
      proofContext: true,
      displayItems: [
        { name: 'givenName', value: 'Ada' },
        { name: 'birthDate', value: '1815-12-10' },
      ] as any,
    })

    expect(result.proofContext).toBe(true)
    expect(result.items).toHaveLength(2)
    expect(result.items.map((item) => item.key)).toEqual(['givenName', 'birthDate'])
    expect(result.items[1]).toMatchObject({
      label: 'Date of Birth',
      format: 'date',
      isPII: true,
    })
  })

  test('keeps mapping the full credential subject when proof display items are not provided', () => {
    const result = mapW3CToCard(input, 'credential-id', { proofContext: true })

    expect(result.proofContext).toBe(true)
    expect(result.items.map((item) => item.key)).toEqual(['givenName', 'familyName', 'birthDate'])
  })
})

describe('mapCredentialTypeToCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('passes W3C proof display items through with OCA formats and PII flags from the resolved bundle', async () => {
    mockGetCredentialForDisplay.mockReturnValue({
      id: 'credential-id',
      display: {
        issuer: { name: 'Issuer Inc.' },
        name: 'Employee Credential',
      },
      metadata: {
        type: 'EmployeeCredential',
      },
      credentialSubject: {
        givenName: 'Ada',
        birthDate: '1815-12-10',
      },
    })

    const credential = Object.create(W3cCredentialRecord.prototype)
    const result = await mapCredentialTypeToCard({
      credential,
      bundleResolver: {
        getBrandingOverlayType: () => BrandingOverlayType.Branding10,
      } as any,
      colorPalette: {} as any,
      unknownIssuerName: 'Unknown Contact',
      proof: true,
      displayItems: [{ name: 'birthDate', value: '1815-12-10' }] as any,
      brandingOverlay: {
        brandingOverlay: {
          primaryBackgroundColor: '#ffffff',
        },
        bundle: {
          labelOverlay: {
            attributeLabels: {
              birthDate: 'Date of Birth',
            },
          },
          bundle: {
            attributes: [{ name: 'birthDate', format: 'date' }],
            flaggedAttributes: [{ name: 'birthDate' }],
          },
        },
      } as any,
    })

    expect(result?.proofContext).toBe(true)
    expect(result?.items).toEqual([
      expect.objectContaining({
        key: 'birthDate',
        label: 'Date of Birth',
        format: 'date',
        isPII: true,
      }),
    ])
  })
})
