import { CredentialExchangeRecord, CredentialState } from '@credo-ts/core'

import { getEffectiveCredentialName } from '../../src/utils/credential'
import { fallbackDefaultCredentialNameValue } from '../../src/utils/cred-def'

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

describe('getEffectiveCredentialName integration in helpers', () => {
  test('returns consistent name when used in processProofAttributes context', () => {
    const credential = createMockCredential()
    const ocaName = 'Test Credential Name'

    // Simulate the usage pattern from processProofAttributes
    const credName = credential ? getEffectiveCredentialName(credential, ocaName) : 'fallback-key'

    expect(credName).toBe(ocaName)
  })

  test('returns fallback when credential is null in helpers context', () => {
    const credential = null
    const key = 'fallback-key'

    // Simulate the usage pattern from processProofAttributes
    const credName = credential ? getEffectiveCredentialName(credential, undefined) : key

    expect(credName).toBe(key)
  })

  test('handles undefined ocaName in helpers context', () => {
    const credential = createMockCredential()

    // Simulate the usage pattern from processProofPredicates
    const credName = credential ? getEffectiveCredentialName(credential, undefined) : 'fallback-key'

    expect(credName).toBe(fallbackDefaultCredentialNameValue)
  })

  test('works correctly with ternary operator pattern used in helpers', () => {
    const credential = createMockCredential()
    const credNameRestriction = 'Restriction Name'
    const key = 'fallback-key'

    // Simulate the exact pattern from processProofPredicates
    const credName = credential ? getEffectiveCredentialName(credential, undefined) : credNameRestriction ?? key

    expect(credName).toBe(fallbackDefaultCredentialNameValue)
  })

  test('handles empty credential with restriction fallback', () => {
    const credential = null
    const credNameRestriction = 'Restriction Name'
    const key = 'fallback-key'

    // Simulate the exact pattern from processProofPredicates
    const credName = credential ? getEffectiveCredentialName(credential, undefined) : credNameRestriction ?? key

    expect(credName).toBe(credNameRestriction)
  })

  test('handles empty credential with key fallback', () => {
    const credential = null
    const credNameRestriction = null
    const key = 'fallback-key'

    // Simulate the exact pattern from processProofPredicates
    const credName = credential ? getEffectiveCredentialName(credential, undefined) : credNameRestriction ?? key

    expect(credName).toBe(key)
  })
})
