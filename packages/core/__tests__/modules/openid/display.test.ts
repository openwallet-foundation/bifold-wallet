import { ClaimFormat, Hasher, Mdoc, MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import {
  filterAndMapSdJwtKeys,
  getCredentialForDisplay,
  recursivelyMapAttribues,
} from '../../../src/modules/openid/display'
import { getOpenId4VcCredentialMetadata } from '../../../src/modules/openid/metadata'
import { decodeSdJwtSync, getClaimsSync } from '@sd-jwt/decode'

jest.mock('../../../src/modules/openid/metadata', () => ({
  getOpenId4VcCredentialMetadata: jest.fn(),
}))

jest.mock('@sd-jwt/decode', () => ({
  decodeSdJwtSync: jest.fn(),
  getClaimsSync: jest.fn(),
}))

const mockGetOpenId4VcCredentialMetadata = getOpenId4VcCredentialMetadata as jest.Mock
const mockDecodeSdJwtSync = decodeSdJwtSync as jest.Mock
const mockGetClaimsSync = getClaimsSync as jest.Mock

const createRecord = <T extends object>(prototype: T, values: Record<string, unknown> = {}): T => {
  const record = Object.create(prototype)

  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(record, key, {
      value,
      configurable: true,
      enumerable: true,
      writable: true,
    })
  }

  return record as T
}

describe('display helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('recursively maps nested values, dates, maps, and buffers into display-safe primitives', () => {
    const result = recursivelyMapAttribues({
      issued_on: '2024-01-02',
      binary_text: new Uint8Array([65, 66, 67]),
      nested: new Map<string, unknown>([
        ['active', true],
        ['scores', [1, 2]],
      ]),
      items: [new Date('2024-02-03T04:05:00.000Z')],
    })

    expect(result).toEqual({
      issued_on: expect.stringContaining('2024'),
      binary_text: 'ABC',
      nested: {
        active: true,
        scores: [1, 2],
      },
      items: [expect.stringContaining('2024')],
    })
  })

  test('recursively maps jpeg buffers into data urls', () => {
    const result = recursivelyMapAttribues(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))

    expect(result).toBe('data:image/jpeg;base64,/9j/4AAAAAAAAAAA')
  })

  test('filters sd-jwt metadata claims and returns visible properties plus formatted metadata', () => {
    const result = filterAndMapSdJwtKeys({
      _sd_alg: 'sha-256',
      _sd_hash: 'hash',
      iss: 'https://issuer.example',
      vct: 'IdentityCredential',
      cnf: {
        jwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: '11qYAY7RNVc6M_H1dC0vtwQb4X3h6lVvY8f1QmV9H6A',
        },
      },
      iat: 1700000000,
      nbf: 1700003600,
      exp: 1700007200,
      given_name: 'Ada',
      profile: {
        birth_date: '2024-01-02',
      },
    })

    expect(result.visibleProperties).toEqual({
      given_name: 'Ada',
      profile: {
        birth_date: expect.stringContaining('2024'),
      },
    })
    expect(result.metadata).toEqual({
      type: 'IdentityCredential',
      issuer: 'https://issuer.example',
      holder: expect.stringContaining('urn:ietf:params:oauth:jwk-thumbprint:sha-256:'),
      issuedAt: expect.stringContaining('2023'),
      validFrom: expect.stringContaining('2023'),
      validUntil: expect.stringContaining('2023'),
    })
    expect(result.raw.issuedAt).toBeInstanceOf(Date)
    expect(result.raw.validFrom).toBeInstanceOf(Date)
    expect(result.raw.validUntil).toBeInstanceOf(Date)
  })

  test('returns an undefined sd-jwt holder thumbprint when thumbprint calculation fails', () => {
    jest.spyOn(Hasher, 'hash').mockImplementation(() => {
      throw new Error('hash failed')
    })
    const badJwk = { kty: 'OKP' }

    const result = filterAndMapSdJwtKeys({
      iss: 'https://issuer.example',
      vct: 'IdentityCredential',
      cnf: {
        kid: 'did:jwk:123',
        jwk: badJwk,
      },
    })

    expect(result.metadata).toEqual({
      type: 'IdentityCredential',
      issuer: 'https://issuer.example',
      holder: undefined,
    })
  })

  test('builds a W3C credential display from OpenID metadata when present', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://issuer.example',
        display: [
          { locale: 'fr-CA', name: 'Emetteur' },
          {
            locale: 'en-CA',
            name: 'Issuer Example',
            logo: { uri: 'https://issuer.example/logo.png', alt_text: 'Logo' },
          },
        ],
      },
      credential: {
        display: [
          {
            locale: 'en-US',
            name: 'Employee Card',
            description: 'Corporate access credential',
            backgroundColor: '#004400',
            textColor: '#ffffff',
            backgroundImage: { uri: 'https://issuer.example/bg.png', altText: 'Background' },
            primary_overlay_attribute: 'employeeId',
          },
        ],
        credential_subject: {
          employeeId: {
            display: [{ name: 'Employee ID' }],
          },
        },
      },
    })

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-1',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.LdpVc,
        type: ['VerifiableCredential', 'EmployeeCard'],
        issuer: {
          id: 'https://credential-issuer.example',
          name: 'Credential Issuer',
          logoUrl: 'https://credential-issuer.example/logo.png',
        },
        issuanceDate: '2024-01-02T03:04:05.000Z',
        expiryDate: '2025-01-02T03:04:05.000Z',
        credentialSubject: {
          id: 'did:example:holder',
          employeeId: '12345',
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.id).toBe('w3c-credential-cred-1')
    expect(result.display).toEqual({
      name: 'Employee Card',
      description: 'Corporate access credential',
      backgroundColor: '#004400',
      textColor: '#ffffff',
      backgroundImage: { uri: 'https://issuer.example/bg.png', altText: 'Background' },
      primary_overlay_attribute: 'employeeId',
      issuer: {
        name: 'Issuer Example',
        logo: { uri: 'https://issuer.example/logo.png', altText: 'Logo' },
      },
    })
    expect(result.attributes).toEqual({
      id: 'did:example:holder',
      employeeId: '12345',
    })
    expect(result.metadata).toEqual({
      holder: 'did:example:holder',
      issuer: 'https://credential-issuer.example',
      type: 'EmployeeCard',
      issuedAt: expect.stringContaining('2024'),
      validUntil: expect.stringContaining('2025'),
      validFrom: undefined,
    })
    expect(result.claimFormat).toBe(ClaimFormat.LdpVc)
    expect(result.credentialSubject).toEqual({
      employeeId: {
        display: [{ name: 'Employee ID' }],
      },
    })
  })

  test('falls back to JFF credential branding and sanitized type names when OpenID metadata is absent', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue(null)

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-2',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.LdpVc,
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: {
          id: 'https://issuer.example',
          name: 'Example University',
          image: { id: 'https://issuer.example/crest.png' },
        },
        issuanceDate: '2024-01-02T03:04:05.000Z',
        credentialBranding: {
          backgroundColor: '#663399',
        },
        credentialSubject: {
          degree: 'BSc',
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display.name).toBe('University degree credential')
    expect(result.display.backgroundColor).toBe('#663399')
    expect(result.display.issuer).toEqual({
      name: 'Example University',
      logo: { uri: 'https://issuer.example/crest.png' },
    })
    expect(result.metadata.type).toBe('UniversityDegreeCredential')
  })

  test('builds an sd-jwt display using decoded claims and OpenID issuer fallbacks', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://issuer.example',
        display: undefined,
      },
      credential: {
        display: [
          {
            locale: 'fr-CA',
            name: 'Carte Mobile',
            logo: { uri: 'https://issuer.example/card-logo.png', altText: 'Card logo' },
          },
          {
            name: 'Fallback Mobile Credential',
            description: 'Fallback description',
            backgroundColor: '#111111',
            textColor: '#ffffff',
            backgroundImage: { uri: 'https://issuer.example/bg.png', altText: 'Background' },
            primary_overlay_attribute: 'membershipNumber',
            logo: { uri: 'https://issuer.example/card-logo.png', altText: 'Card logo' },
          },
        ],
        credential_subject: {
          membershipNumber: {
            display: [{ name: 'Membership Number' }],
          },
        },
      },
    })

    mockDecodeSdJwtSync.mockReturnValue({
      disclosures: ['disclosure'],
      jwt: {
        payload: 'payload',
      },
    })
    mockGetClaimsSync.mockReturnValue({
      iss: 'https://issuer.example',
      vct: 'MobileCredential',
      cnf: {
        jwk: {
          kty: 'OKP',
          crv: 'Ed25519',
          x: '11qYAY7RNVc6M_H1dC0vtwQb4X3h6lVvY8f1QmV9H6A',
        },
      },
      membershipNumber: 'ABC-123',
    })

    const record = createRecord(SdJwtVcRecord.prototype, {
      id: 'sdjwt-1',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        compact: 'header.payload.signature',
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result).toMatchObject({
      id: 'sd-jwt-vc-sdjwt-1',
      claimFormat: ClaimFormat.SdJwtW3cVc,
      attributes: {
        membershipNumber: 'ABC-123',
      },
      credentialSubject: {
        membershipNumber: {
          display: [{ name: 'Membership Number' }],
        },
      },
      display: {
        name: 'Fallback Mobile Credential',
        description: 'Fallback description',
        backgroundColor: '#111111',
        textColor: '#ffffff',
        backgroundImage: { uri: 'https://issuer.example/bg.png', altText: 'Background' },
        primary_overlay_attribute: 'membershipNumber',
        issuer: {
          name: 'issuer.example',
          domain: 'issuer.example',
          logo: { uri: 'https://issuer.example/card-logo.png', altText: 'Card logo' },
        },
      },
      metadata: {
        type: 'MobileCredential',
        issuer: 'https://issuer.example',
      },
    })
    expect(mockDecodeSdJwtSync).toHaveBeenCalledWith('header.payload.signature', expect.any(Function))
    expect(mockGetClaimsSync).toHaveBeenCalledWith('payload', ['disclosure'], expect.any(Function))
  })

  test('builds an mdoc display with metadata fallback and flattened namespaces', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://dmv.example',
        display: undefined,
      },
      credential: {
        display: [
          {
            name: 'Mobile Driver License',
            description: 'Provincial driving privilege',
            backgroundColor: '#004477',
            textColor: '#ffffff',
            backgroundImage: { uri: 'https://dmv.example/card.png', altText: 'Card background' },
          },
        ],
        credential_subject: {
          portrait: {
            display: [{ name: 'Portrait' }],
          },
        },
      },
    })

    jest.spyOn(Mdoc, 'fromBase64Url').mockReturnValue({
      issuerSignedNamespaces: {
        org_iso_18013_5_1: {
          family_name: 'Doe',
          portrait: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]),
        },
        org_example: {
          age_over_18: true,
        },
      },
      docType: 'org.iso.18013.5.1.mDL',
      validityInfo: {
        validFrom: new Date('2024-01-01T00:00:00.000Z'),
        validUntil: new Date('2025-01-01T00:00:00.000Z'),
      },
    } as unknown as ReturnType<typeof Mdoc.fromBase64Url>)

    const record = createRecord(MdocRecord.prototype, {
      id: 'mdoc-1',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        base64Url: 'encoded-mdoc',
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result).toMatchObject({
      id: 'mdoc-mdoc-1',
      claimFormat: ClaimFormat.MsoMdoc,
      metadata: {
        issuer: 'Unknown',
        type: 'org.iso.18013.5.1.mDL',
      },
      credentialSubject: {
        portrait: {
          display: [{ name: 'Portrait' }],
        },
      },
      display: {
        name: 'Mobile Driver License',
        description: 'Provincial driving privilege',
        backgroundColor: '#004477',
        textColor: '#ffffff',
        backgroundImage: { uri: 'https://dmv.example/card.png', altText: 'Card background' },
        issuer: {
          name: 'dmv.example',
          domain: 'dmv.example',
        },
      },
      attributes: {
        family_name: 'Doe',
        age_over_18: true,
        portrait: 'data:image/jpeg;base64,/9j/4AAAAAAAAAAA',
      },
    })
  })

  test('prefers locale-less OpenID display values when no english locale is available', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://issuer.example',
        display: [{ locale: 'fr-CA', name: 'Emetteur FR' }, { name: 'Issuer Default' }],
      },
      credential: {
        display: [{ locale: 'fr-CA', name: 'Carte FR' }, { name: 'Default Credential Name' }],
      },
    })

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-locale-fallback',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.LdpVc,
        type: ['VerifiableCredential', 'LocaleFallbackCredential'],
        issuer: {
          id: 'https://issuer.example',
        },
        issuanceDate: '2024-01-02T03:04:05.000Z',
        credentialSubject: {
          id: 'did:example:holder',
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display.name).toBe('Default Credential Name')
    expect(result.display.issuer).toEqual({
      name: 'Issuer Default',
    })
  })

  test('falls back to the first OpenID display entry when neither english nor locale-less values exist', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://issuer.example',
        display: [
          { locale: 'fr-CA', name: 'Emetteur FR' },
          { locale: 'de-DE', name: 'Aussteller DE' },
        ],
      },
      credential: {
        display: [
          { locale: 'fr-CA', name: 'Carte FR' },
          { locale: 'de-DE', name: 'Karte DE' },
        ],
      },
    })

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-first-fallback',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.LdpVc,
        type: ['VerifiableCredential', 'LocaleFallbackCredential'],
        issuer: {
          id: 'https://issuer.example',
        },
        issuanceDate: '2024-01-02T03:04:05.000Z',
        credentialSubject: {
          id: 'did:example:holder',
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display.name).toBe('Carte FR')
    expect(result.display.issuer).toEqual({
      name: 'Emetteur FR',
    })
  })

  test('uses credential display logo and issuer hostname fallback when issuer display metadata is absent', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue({
      issuer: {
        id: 'https://issuer.example/path',
        display: undefined,
      },
      credential: {
        display: [
          {
            name: 'Logo Fallback Credential',
            logo: { uri: 'https://issuer.example/cred-logo.png', altText: 'Credential logo' },
          },
        ],
      },
    })

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-logo-fallback',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.LdpVc,
        type: ['VerifiableCredential', 'LogoFallbackCredential'],
        issuer: {
          id: 'https://issuer.example/path',
        },
        issuanceDate: '2024-01-02T03:04:05.000Z',
        credentialSubject: {
          id: 'did:example:holder',
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display.issuer).toEqual({
      name: 'issuer.example',
      logo: { uri: 'https://issuer.example/cred-logo.png', altText: 'Credential logo' },
    })
  })

  test('builds a jwt-vc display using the nested credential payload and first credential subject entry', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue(null)

    const record = createRecord(W3cCredentialRecord.prototype, {
      id: 'cred-jwt-vc',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        claimFormat: ClaimFormat.JwtVc,
        credential: {
          type: ['VerifiableCredential', 'JwtEmployeeCredential'],
          issuer: {
            id: 'https://issuer.example',
            name: 'Example Issuer',
            image: 'https://issuer.example/logo.png',
          },
          issuanceDate: '2024-01-02T03:04:05.000Z',
          expiryDate: '2025-01-02T03:04:05.000Z',
          credentialSubject: [
            {
              id: 'did:example:first',
              employeeId: 'A-123',
            },
            {
              id: 'did:example:second',
              employeeId: 'B-456',
            },
          ],
        },
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.attributes).toEqual({
      id: 'did:example:first',
      employeeId: 'A-123',
    })
    expect(result.metadata).toMatchObject({
      holder: 'did:example:first',
      issuer: 'https://issuer.example',
      type: 'JwtEmployeeCredential',
    })
    expect(result.display).toMatchObject({
      name: 'Jwt employee credential',
      issuer: {
        name: 'Example Issuer',
        logo: { uri: 'https://issuer.example/logo.png' },
      },
    })
    expect(result.claimFormat).toBe(ClaimFormat.JwtVc)
  })

  test('falls back to sanitized sd-jwt vct when OpenID metadata is absent', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue(null)

    mockDecodeSdJwtSync.mockReturnValue({
      disclosures: [],
      jwt: {
        payload: 'payload',
      },
    })
    mockGetClaimsSync.mockReturnValue({
      iss: 'https://issuer.example',
      vct: 'ExampleEmployeeCard',
      cnf: {},
      employee_number: '12345',
    })

    const record = createRecord(SdJwtVcRecord.prototype, {
      id: 'sdjwt-fallback',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        compact: 'header.payload.signature',
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display).toMatchObject({
      name: 'Example employee card',
      issuer: {
        name: 'Unknown',
      },
    })
    expect(result.attributes).toEqual({
      employee_number: '12345',
    })
  })

  test('falls back to generic mdoc display values when OpenID metadata is absent', () => {
    mockGetOpenId4VcCredentialMetadata.mockReturnValue(null)

    jest.spyOn(Mdoc, 'fromBase64Url').mockReturnValue({
      issuerSignedNamespaces: {
        org_iso_18013_5_1: {
          family_name: 'Doe',
        },
      },
      docType: 'org.iso.18013.5.1.mDL',
      validityInfo: {
        validFrom: new Date('2024-01-01T00:00:00.000Z'),
        validUntil: new Date('2025-01-01T00:00:00.000Z'),
      },
    } as unknown as ReturnType<typeof Mdoc.fromBase64Url>)

    const record = createRecord(MdocRecord.prototype, {
      id: 'mdoc-no-metadata',
      createdAt: new Date('2024-01-02T03:04:05.000Z'),
      firstCredential: {
        base64Url: 'encoded-mdoc',
      },
    })

    const result = getCredentialForDisplay(record)

    expect(result.display).toEqual({
      name: 'Credential',
      issuer: {
        name: 'Unknown',
      },
    })
    expect(result.metadata).toEqual({
      issuer: 'Unknown',
      type: 'org.iso.18013.5.1.mDL',
    })
  })
})
