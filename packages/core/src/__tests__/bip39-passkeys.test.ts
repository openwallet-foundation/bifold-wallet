/**
 * Integration test for BIP39 Deterministic Passkeys
 *
 * This test verifies that the BIP39 passkey functionality works correctly
 * with the hashmap-credo-core fork.
 */

import {
  generateDeterministicPasskey,
  validateMnemonic,
  generateDeterministicUserHandle,
  type PasskeyGenerationOptions,
} from '../utils/bip39-passkeys'

describe('BIP39 Deterministic Passkeys', () => {
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const testOrigin = 'https://test.rocca-wallet.com'

  test('validates mnemonic phrases correctly', () => {
    expect(validateMnemonic(testMnemonic)).toBe(true)
    expect(validateMnemonic('invalid mnemonic')).toBe(false)
    expect(validateMnemonic('')).toBe(false)
  })

  test('generates deterministic user handles', () => {
    const userHandle1 = generateDeterministicUserHandle('user123', 'example.com')
    expect(userHandle1).toBe('user123@example.com')

    const userHandle2 = generateDeterministicUserHandle('test', 'rocca-wallet.com')
    expect(userHandle2).toBe('test@rocca-wallet.com')
  })

  test('generates deterministic P-256 passkeys', async () => {
    const options: PasskeyGenerationOptions = {
      mnemonic: testMnemonic,
      origin: testOrigin,
      userHandle: 'testuser@rocca-wallet.com',
      counter: 0,
    }

    const passkey1 = await generateDeterministicPasskey(options)
    const passkey2 = await generateDeterministicPasskey(options)

    // Same inputs should generate the same key
    expect(passkey1.publicKeyBase58).toBe(passkey2.publicKeyBase58)
    expect(passkey1.fingerprint).toBe(passkey2.fingerprint)

    // Key should be P-256 type
    expect(passkey1.keyType).toBe('p256')
  })

  test('generates different keys with different counters', async () => {
    const baseOptions: PasskeyGenerationOptions = {
      mnemonic: testMnemonic,
      origin: testOrigin,
      userHandle: 'testuser@rocca-wallet.com',
      counter: 0,
    }

    const passkey1 = await generateDeterministicPasskey(baseOptions)
    const passkey2 = await generateDeterministicPasskey({ ...baseOptions, counter: 1 })

    // Different counters should generate different keys
    expect(passkey1.publicKeyBase58).not.toBe(passkey2.publicKeyBase58)
    expect(passkey1.fingerprint).not.toBe(passkey2.fingerprint)
  })

  test('generates different keys with different origins', async () => {
    const baseOptions: PasskeyGenerationOptions = {
      mnemonic: testMnemonic,
      origin: testOrigin,
      userHandle: 'testuser@rocca-wallet.com',
      counter: 0,
    }

    const passkey1 = await generateDeterministicPasskey(baseOptions)
    const passkey2 = await generateDeterministicPasskey({
      ...baseOptions,
      origin: 'https://different.example.com',
    })

    // Different origins should generate different keys
    expect(passkey1.publicKeyBase58).not.toBe(passkey2.publicKeyBase58)
    expect(passkey1.fingerprint).not.toBe(passkey2.fingerprint)
  })

  test('generates different keys with different user handles', async () => {
    const baseOptions: PasskeyGenerationOptions = {
      mnemonic: testMnemonic,
      origin: testOrigin,
      userHandle: 'testuser@rocca-wallet.com',
      counter: 0,
    }

    const passkey1 = await generateDeterministicPasskey(baseOptions)
    const passkey2 = await generateDeterministicPasskey({
      ...baseOptions,
      userHandle: 'different-user@rocca-wallet.com',
    })

    // Different user handles should generate different keys
    expect(passkey1.publicKeyBase58).not.toBe(passkey2.publicKeyBase58)
    expect(passkey1.fingerprint).not.toBe(passkey2.fingerprint)
  })

  test('throws error with invalid mnemonic', async () => {
    const options: PasskeyGenerationOptions = {
      mnemonic: 'invalid mnemonic phrase',
      origin: testOrigin,
      userHandle: 'testuser@rocca-wallet.com',
      counter: 0,
    }

    // This might throw an error depending on your implementation
    // Adjust the test based on how your BIP39 implementation handles invalid mnemonics
    await expect(generateDeterministicPasskey(options)).rejects.toThrow()
  })
})
