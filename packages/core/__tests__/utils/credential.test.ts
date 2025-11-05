import { CredentialExchangeRecord, CredentialState } from '@credo-ts/core'

import { getEffectiveCredentialName, isValidCredentialName } from '../../src/utils/credential'
import { fallbackDefaultCredentialNameValue, defaultCredDefTag } from '../../src/utils/cred-def'

// Mock credential record for testing
const createMockCredential = (overrides: Partial<CredentialExchangeRecord> = {}): CredentialExchangeRecord => {
  return {
    id: 'test-credential-id',
    state: CredentialState.Done,
    createdAt: new Date(),
    updatedAt: new Date(),
    connectionId: 'test-connection-id',
    threadId: 'test-thread-id',
    protocolVersion: 'v1',
    credentials: [],
    credentialAttributes: [],
    revocationNotification: undefined,
    metadata: new Map(),
    tags: {},
    _tags: {},
    ...overrides,
  } as unknown as CredentialExchangeRecord
}

describe('isValidCredentialName', () => {
  test('returns true for valid, meaningful names', () => {
    expect(isValidCredentialName('Valid Credential Name')).toBe(true)
    expect(isValidCredentialName('Driver License')).toBe(true)
    expect(isValidCredentialName('My Custom Name')).toBe(true)
  })

  test('returns false for undefined', () => {
    expect(isValidCredentialName(undefined)).toBe(false)
  })

  test('returns false for empty string', () => {
    expect(isValidCredentialName('')).toBe(false)
  })

  test('returns false for whitespace-only strings', () => {
    expect(isValidCredentialName('   ')).toBe(false)
    expect(isValidCredentialName('\t')).toBe(false)
    expect(isValidCredentialName('\n')).toBe(false)
  })

  test('returns false for default credential def tag', () => {
    expect(isValidCredentialName(defaultCredDefTag)).toBe(false)
  })

  test('returns false for fallback default credential name', () => {
    expect(isValidCredentialName(fallbackDefaultCredentialNameValue)).toBe(false)
  })

  test('returns true for names with leading/trailing spaces that trim to valid', () => {
    expect(isValidCredentialName('  Valid Name  ')).toBe(true)
  })

  test('returns false for case variations of reserved names', () => {
    // The function checks exact match, so these should return true
    expect(isValidCredentialName('DEFAULT')).toBe(true)
    expect(isValidCredentialName('credential')).toBe(true)
  })
})

describe('getEffectiveCredentialName', () => {
  test('returns OCA name when valid', () => {
    const credential = createMockCredential()
    const ocaName = 'Valid OCA Name'

    const result = getEffectiveCredentialName(credential, ocaName)

    expect(result).toBe(ocaName)
  })

  test('ignores OCA name when it matches default credential def tag', () => {
    const credential = createMockCredential()
    const ocaName = defaultCredDefTag

    const result = getEffectiveCredentialName(credential, ocaName)

    expect(result).toBe(fallbackDefaultCredentialNameValue)
  })

  test('ignores OCA name when it matches fallback default name', () => {
    const credential = createMockCredential()
    const ocaName = fallbackDefaultCredentialNameValue

    const result = getEffectiveCredentialName(credential, ocaName)

    expect(result).toBe(fallbackDefaultCredentialNameValue)
  })

  test('ignores OCA name when empty or whitespace', () => {
    const credential = createMockCredential()

    expect(getEffectiveCredentialName(credential, '')).toBe(fallbackDefaultCredentialNameValue)
    expect(getEffectiveCredentialName(credential, '   ')).toBe(fallbackDefaultCredentialNameValue)
    expect(getEffectiveCredentialName(credential, undefined)).toBe(fallbackDefaultCredentialNameValue)
  })

  test('returns fallback when no valid name is found', () => {
    const credential = createMockCredential()

    const result = getEffectiveCredentialName(credential)

    expect(result).toBe(fallbackDefaultCredentialNameValue)
  })

  test('uses isValidCredentialName helper function correctly', () => {
    const credential = createMockCredential()

    // Test various invalid names
    const invalidNames = [defaultCredDefTag, fallbackDefaultCredentialNameValue, '', '   ', undefined]

    invalidNames.forEach((invalidName) => {
      const result = getEffectiveCredentialName(credential, invalidName as string)
      expect(result).toBe(fallbackDefaultCredentialNameValue)
    })

    // Test valid name
    const validName = 'Valid Credential Name'
    const result = getEffectiveCredentialName(credential, validName)
    expect(result).toBe(validName)
  })
})
