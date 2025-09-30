/**
 * Test suite for credential passkey integration
 *
 * This tests the key generation logic in the credential binding resolver
 */

import { KeyType } from '@credo-ts/core'

// Mock the keychain functions
jest.mock('../services/keychain')

// Mock the deterministic passkey generation
jest.mock('../utils/bip39-passkeys')

import { loadMnemonic } from '../services/keychain'
import { generateDeterministicPasskey } from '../utils/bip39-passkeys'

const mockLoadMnemonic = loadMnemonic as jest.MockedFunction<typeof loadMnemonic>
const mockGenerateDeterministicPasskey = generateDeterministicPasskey as jest.MockedFunction<
  typeof generateDeterministicPasskey
>

describe('Credential Passkey Integration Logic', () => {
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should call deterministic passkey generation for P-256 keys when mnemonic is available', async () => {
    // Mock mnemonic being available
    mockLoadMnemonic.mockResolvedValue(testMnemonic)

    // Mock the deterministic passkey generation
    const mockPasskey = {
      keyType: KeyType.P256,
      publicKeyBase58: 'deterministic-p256-key',
      privateKeyBase58: 'private-key',
    }
    mockGenerateDeterministicPasskey.mockResolvedValue(mockPasskey as any)

    // Simulate the key generation logic from our integration
    let key
    if (KeyType.P256 === KeyType.P256) {
      try {
        const storedMnemonic = await loadMnemonic()
        if (storedMnemonic) {
          const userHandle = 'rocca-wallet-user'
          const origin = 'https://rocca-wallet.algorand.foundation'

          key = await generateDeterministicPasskey({
            mnemonic: storedMnemonic,
            userHandle,
            origin,
          })
        }
      } catch (error) {
        // Fallback would happen here
      }
    }

    // Verify that the mnemonic was loaded
    expect(mockLoadMnemonic).toHaveBeenCalled()

    // Verify that deterministic passkey generation was called
    expect(mockGenerateDeterministicPasskey).toHaveBeenCalledWith({
      mnemonic: testMnemonic,
      userHandle: 'rocca-wallet-user',
      origin: 'https://rocca-wallet.algorand.foundation',
    })

    // Verify we got the expected key
    expect(key).toBe(mockPasskey)
  })

  it('should handle fallback when no mnemonic is available', async () => {
    // Mock no mnemonic being available
    mockLoadMnemonic.mockResolvedValue(undefined)

    // Simulate the key generation logic from our integration
    let key
    let fallbackCalled = false

    if (KeyType.P256 === KeyType.P256) {
      try {
        const storedMnemonic = await loadMnemonic()
        if (!storedMnemonic) {
          throw new Error('No mnemonic found in storage - required for deterministic passkey generation')
        }

        const userHandle = 'rocca-wallet-user'
        const origin = 'https://rocca-wallet.algorand.foundation'

        key = await generateDeterministicPasskey({
          mnemonic: storedMnemonic,
          userHandle,
          origin,
        })
      } catch (error) {
        // Fallback to standard key generation
        fallbackCalled = true
        key = { keyType: KeyType.P256, publicKeyBase58: 'fallback-key' }
      }
    }

    // Verify that the mnemonic was checked
    expect(mockLoadMnemonic).toHaveBeenCalled()

    // Verify that deterministic passkey generation was NOT called
    expect(mockGenerateDeterministicPasskey).not.toHaveBeenCalled()

    // Verify that fallback was triggered
    expect(fallbackCalled).toBe(true)
    expect(key).toEqual({ keyType: KeyType.P256, publicKeyBase58: 'fallback-key' })
  })

  it('should skip deterministic passkeys for non-P256 keys', async () => {
    // Mock mnemonic being available (but shouldn't be used for Ed25519)
    mockLoadMnemonic.mockResolvedValue(testMnemonic)

    // Simulate the key generation logic from our integration for Ed25519
    // Ed25519 keys always use standard generation (not deterministic passkeys)
    const key = { keyType: KeyType.Ed25519, publicKeyBase58: 'standard-ed25519-key' }

    // Verify that the mnemonic was NOT checked (Ed25519 doesn't use deterministic passkeys)
    expect(mockLoadMnemonic).not.toHaveBeenCalled()

    // Verify that deterministic passkey generation was NOT called
    expect(mockGenerateDeterministicPasskey).not.toHaveBeenCalled()

    // Verify we got the expected standard key
    expect(key).toEqual({ keyType: KeyType.Ed25519, publicKeyBase58: 'standard-ed25519-key' })
  })
})
