/**
 * Unit tests for MnemonicStorage service
 *
 * Tests encryption, decryption, and keychain storage of BIP39 mnemonics
 */

import {
  encryptMnemonic,
  decryptMnemonic,
  storeMnemonicInKeychain,
  loadMnemonicFromKeychain,
  deleteMnemonicFromKeychain,
  hasMnemonicInKeychain,
  encryptAndStoreMnemonic,
  loadAndDecryptMnemonic,
  storeMnemonicPlain,
  storeMnemonicForBackup,
  loadMnemonicForBackup,
  deleteMnemonicForBackup,
  EncryptedMnemonic,
} from '../MnemonicStorage'

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: {
    ALWAYS: 'Always',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY: 'BiometryAny',
  },
  SECURITY_LEVEL: {
    ANY: 'Any',
  },
  STORAGE_TYPE: {
    AES: 'AES',
    RSA: 'RSA',
  },
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}))

// Mock react-native-quick-crypto is already set up in __mocks__

import Keychain from 'react-native-keychain'

describe('MnemonicStorage Service', () => {
  // Test mnemonic
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const testPin = '123456'
  const wrongPin = '654321'

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('encryptMnemonic', () => {
    it('should encrypt mnemonic with PIN', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Should return encrypted data structure
      expect(encrypted).toHaveProperty('ciphertext')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('authTag')
      expect(encrypted).toHaveProperty('salt')
      expect(encrypted).toHaveProperty('algorithm')
      expect(encrypted).toHaveProperty('iterations')

      // Algorithm should be AES-256-GCM
      expect(encrypted.algorithm).toBe('aes-256-gcm')

      // Iterations should be 100000
      expect(encrypted.iterations).toBe(100000)

      // All fields should be base64 strings
      expect(typeof encrypted.ciphertext).toBe('string')
      expect(typeof encrypted.iv).toBe('string')
      expect(typeof encrypted.authTag).toBe('string')
      expect(typeof encrypted.salt).toBe('string')

      // Ciphertext should not be empty
      expect(encrypted.ciphertext.length).toBeGreaterThan(0)
    })

    it('should produce different ciphertext each time (random IV and salt)', async () => {
      const encrypted1 = await encryptMnemonic(testMnemonic, testPin)
      const encrypted2 = await encryptMnemonic(testMnemonic, testPin)
      const encrypted3 = await encryptMnemonic(testMnemonic, testPin)

      // Ciphertexts should be different (due to random IV)
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
      expect(encrypted2.ciphertext).not.toBe(encrypted3.ciphertext)

      // IVs should be different
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted2.iv).not.toBe(encrypted3.iv)

      // Salts should be different
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted2.salt).not.toBe(encrypted3.salt)
    })

    it('should produce different ciphertext for different PINs', async () => {
      const encrypted1 = await encryptMnemonic(testMnemonic, '111111')
      const encrypted2 = await encryptMnemonic(testMnemonic, '222222')

      // Ciphertexts should be different
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
    })

    it('should handle empty mnemonic', async () => {
      const encrypted = await encryptMnemonic('', testPin)

      // Should still encrypt (even if empty)
      expect(encrypted.ciphertext).toBeDefined()
    })

    it('should handle long mnemonic (24 words)', async () => {
      const longMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'

      const encrypted = await encryptMnemonic(longMnemonic, testPin)

      // Should encrypt successfully
      expect(encrypted.ciphertext).toBeDefined()
      expect(encrypted.ciphertext.length).toBeGreaterThan(0)
    })

    it('should throw error on encryption failure', async () => {
      // This is hard to test without mocking crypto functions
      // But we can test with invalid inputs
      await expect(encryptMnemonic(null as any, testPin)).rejects.toThrow()
      await expect(encryptMnemonic(testMnemonic, null as any)).rejects.toThrow()
    })
  })

  describe('decryptMnemonic', () => {
    it('should decrypt mnemonic with correct PIN', async () => {
      // Encrypt first
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Decrypt with same PIN
      const decrypted = await decryptMnemonic(encrypted, testPin)

      // Should match original mnemonic
      expect(decrypted).toBe(testMnemonic)
    })

    it('should throw error with wrong PIN', async () => {
      // Encrypt with one PIN
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Try to decrypt with wrong PIN
      await expect(decryptMnemonic(encrypted, wrongPin)).rejects.toThrow('Incorrect PIN')
    })

    it('should be deterministic (same encrypted data produces same result)', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const decrypted1 = await decryptMnemonic(encrypted, testPin)
      const decrypted2 = await decryptMnemonic(encrypted, testPin)
      const decrypted3 = await decryptMnemonic(encrypted, testPin)

      // All should be identical
      expect(decrypted1).toBe(decrypted2)
      expect(decrypted2).toBe(decrypted3)
      expect(decrypted1).toBe(testMnemonic)
    })

    it('should handle empty mnemonic', async () => {
      const encrypted = await encryptMnemonic('', testPin)
      const decrypted = await decryptMnemonic(encrypted, testPin)

      expect(decrypted).toBe('')
    })

    it('should handle long mnemonic (24 words)', async () => {
      const longMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'

      const encrypted = await encryptMnemonic(longMnemonic, testPin)
      const decrypted = await decryptMnemonic(encrypted, testPin)

      expect(decrypted).toBe(longMnemonic)
    })

    it('should throw error with tampered ciphertext', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Tamper with ciphertext
      const tampered: EncryptedMnemonic = {
        ...encrypted,
        ciphertext: 'tampered' + encrypted.ciphertext,
      }

      // Should fail authentication
      await expect(decryptMnemonic(tampered, testPin)).rejects.toThrow()
    })

    it('should throw error with tampered auth tag', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Tamper with auth tag
      const tampered: EncryptedMnemonic = {
        ...encrypted,
        authTag: Buffer.from('tampered').toString('base64'),
      }

      // Should fail authentication
      await expect(decryptMnemonic(tampered, testPin)).rejects.toThrow()
    })

    it('should throw error with invalid base64', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Invalid base64
      const invalid: EncryptedMnemonic = {
        ...encrypted,
        ciphertext: 'not-valid-base64!!!',
      }

      await expect(decryptMnemonic(invalid, testPin)).rejects.toThrow()
    })
  })

  describe('storeMnemonicInKeychain', () => {
    it('should store encrypted mnemonic in keychain', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Mock successful storage
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      const result = await storeMnemonicInKeychain(encrypted, false)

      // Should return true
      expect(result).toBe(true)

      // Should call setGenericPassword
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1)

      // Check call arguments
      const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      expect(call[0]).toBe('BifoldMnemonicUser') // username
      expect(typeof call[1]).toBe('string') // password (JSON string)
      expect(call[2]).toHaveProperty('service') // options
    })

    it('should store with biometrics flag', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      await storeMnemonicInKeychain(encrypted, true)

      // Check options include biometric settings
      const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      const options = call[2]

      expect(options.accessible).toBe('WhenUnlockedThisDeviceOnly')
      expect(options.accessControl).toBe('BiometryAny')
    })

    it('should store without biometrics flag', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      await storeMnemonicInKeychain(encrypted, false)

      // Check options don't include biometric settings
      const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      const options = call[2]

      expect(options.accessible).toBe('Always')
      expect(options.accessControl).toBeUndefined()
    })

    it('should include timestamp in stored data', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      const beforeTime = Date.now()
      await storeMnemonicInKeychain(encrypted, false)
      const afterTime = Date.now()

      // Parse stored data
      const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      const storedData = JSON.parse(call[1])

      expect(storedData).toHaveProperty('storedAt')
      expect(storedData.storedAt).toBeGreaterThanOrEqual(beforeTime)
      expect(storedData.storedAt).toBeLessThanOrEqual(afterTime)
    })

    it('should throw error if storage fails', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Mock storage failure
      ;(Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      await expect(storeMnemonicInKeychain(encrypted, false)).rejects.toThrow('Failed to store mnemonic in keychain')
    })
  })

  describe('loadMnemonicFromKeychain', () => {
    it('should load encrypted mnemonic from keychain', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Mock keychain data
      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: false,
        storedAt: Date.now(),
      }

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(keychainData),
      })

      const loaded = await loadMnemonicFromKeychain()

      // Should return encrypted mnemonic
      expect(loaded).toEqual(encrypted)

      // Should call getGenericPassword
      expect(Keychain.getGenericPassword).toHaveBeenCalledTimes(1)
    })

    it('should return undefined if no mnemonic stored', async () => {
      // Mock no data
      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false)

      const loaded = await loadMnemonicFromKeychain()

      expect(loaded).toBeUndefined()
    })

    it('should support biometric prompt', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: true,
        storedAt: Date.now(),
      }

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(keychainData),
      })

      const biometricPrompt = {
        title: 'Authenticate',
        description: 'Unlock your wallet',
      }

      await loadMnemonicFromKeychain(biometricPrompt)

      // Check options include biometric prompt
      const call = (Keychain.getGenericPassword as jest.Mock).mock.calls[0]
      const options = call[0]

      expect(options.authenticationPrompt).toEqual(biometricPrompt)
    })

    it('should throw error if keychain data is invalid', async () => {
      // Mock invalid data (missing encryptedMnemonic)
      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify({ useBiometrics: false }),
      })

      await expect(loadMnemonicFromKeychain()).rejects.toThrow('Invalid keychain data')
    })

    it('should throw error if keychain access fails', async () => {
      // Mock keychain error
      ;(Keychain.getGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      await expect(loadMnemonicFromKeychain()).rejects.toThrow('Failed to load mnemonic from keychain')
    })
  })

  describe('deleteMnemonicFromKeychain', () => {
    it('should delete mnemonic from keychain', async () => {
      // Mock successful deletion
      ;(Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true)

      const result = await deleteMnemonicFromKeychain()

      // Should return true
      expect(result).toBe(true)

      // Should call resetGenericPassword
      expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1)
    })

    it('should throw error if deletion fails', async () => {
      // Mock deletion failure
      ;(Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      await expect(deleteMnemonicFromKeychain()).rejects.toThrow('Failed to delete mnemonic from keychain')
    })
  })

  describe('hasMnemonicInKeychain', () => {
    it('should return true if mnemonic exists', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: false,
        storedAt: Date.now(),
      }

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(keychainData),
      })

      const exists = await hasMnemonicInKeychain()

      expect(exists).toBe(true)
    })

    it('should return false if no mnemonic stored', async () => {
      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false)

      const exists = await hasMnemonicInKeychain()

      expect(exists).toBe(false)
    })

    it('should return false on keychain error', async () => {
      ;(Keychain.getGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      const exists = await hasMnemonicInKeychain()

      expect(exists).toBe(false)
    })
  })

  describe('encryptAndStoreMnemonic (convenience function)', () => {
    it('should encrypt and store mnemonic in one call', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      const result = await encryptAndStoreMnemonic(testMnemonic, testPin, false)

      // Should return true
      expect(result).toBe(true)

      // Should call setGenericPassword twice: once for encrypted, once for backup
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2)
    })

    it('should support biometrics flag', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      await encryptAndStoreMnemonic(testMnemonic, testPin, true)

      // First call should include biometric settings (main storage)
      const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      const options = call[2]

      expect(options.accessible).toBe('WhenUnlockedThisDeviceOnly')
      expect(options.accessControl).toBe('BiometryAny')
    })

    it('should throw error if encryption fails', async () => {
      await expect(encryptAndStoreMnemonic(null as any, testPin, false)).rejects.toThrow()
    })

    it('should throw error if storage fails', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      await expect(encryptAndStoreMnemonic(testMnemonic, testPin, false)).rejects.toThrow()
    })
  })

  describe('loadAndDecryptMnemonic (convenience function)', () => {
    it('should load and decrypt mnemonic in one call', async () => {
      // First encrypt and store
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: false,
        storedAt: Date.now(),
      }

      // Mock main keychain storage
      ;(Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          username: 'BifoldMnemonicUser',
          password: JSON.stringify(keychainData),
        })
        // Mock backup storage for self-decryption
        .mockResolvedValueOnce({
          username: 'BackupMnemonic',
          password: JSON.stringify({ mnemonic: testMnemonic, storedAt: Date.now() }),
        })

      // Load and decrypt
      const decrypted = await loadAndDecryptMnemonic(testPin)

      // Should match original mnemonic
      expect(decrypted).toBe(testMnemonic)
    })

    it('should return undefined if no mnemonic stored', async () => {
      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false)

      const decrypted = await loadAndDecryptMnemonic(testPin)

      expect(decrypted).toBeUndefined()
    })

    it('should throw error with wrong PIN', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: false,
        storedAt: Date.now(),
      }

      // Mock main keychain storage
      ;(Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          username: 'BifoldMnemonicUser',
          password: JSON.stringify(keychainData),
        })
        // Mock backup storage for self-decryption
        .mockResolvedValueOnce({
          username: 'BackupMnemonic',
          password: JSON.stringify({ mnemonic: testMnemonic, storedAt: Date.now() }),
        })

      await expect(loadAndDecryptMnemonic(wrongPin)).rejects.toThrow('Incorrect PIN')
    })

    it('should support biometric prompt', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      const keychainData = {
        encryptedMnemonic: encrypted,
        useBiometrics: true,
        storedAt: Date.now(),
      }

      // Mock main keychain storage
      ;(Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          username: 'BifoldMnemonicUser',
          password: JSON.stringify(keychainData),
        })
        // Mock backup storage for self-decryption
        .mockResolvedValueOnce({
          username: 'BackupMnemonic',
          password: JSON.stringify({ mnemonic: testMnemonic, storedAt: Date.now() }),
        })

      const biometricPrompt = {
        title: 'Authenticate',
        description: 'Unlock your wallet',
      }

      const decrypted = await loadAndDecryptMnemonic(testPin, biometricPrompt)

      expect(decrypted).toBe(testMnemonic)

      // Check biometric prompt was passed
      const call = (Keychain.getGenericPassword as jest.Mock).mock.calls[0]
      expect(call[0].authenticationPrompt).toEqual(biometricPrompt)
    })
  })

  describe('Integration tests', () => {
    it('should complete full encrypt-store-load-decrypt cycle', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      // Step 1: Encrypt and store
      await encryptAndStoreMnemonic(testMnemonic, testPin, false)

      // Get stored data
      const storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      const storedData = JSON.parse(storeCall[1])

      // Step 2: Mock load
      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(storedData),
      })

      // Step 3: Load and decrypt
      const decrypted = await loadAndDecryptMnemonic(testPin)

      // Should match original
      expect(decrypted).toBe(testMnemonic)
    })

    it('should handle multiple store/load cycles', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      // Store first mnemonic
      const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      await encryptAndStoreMnemonic(mnemonic1, testPin, false)

      let storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      let storedData = JSON.parse(storeCall[1])

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(storedData),
      })

      let decrypted = await loadAndDecryptMnemonic(testPin)
      expect(decrypted).toBe(mnemonic1)

      // Store second mnemonic (overwrite)
      const mnemonic2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      await encryptAndStoreMnemonic(mnemonic2, testPin, false)

      storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[1]
      storedData = JSON.parse(storeCall[1])

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(storedData),
      })

      decrypted = await loadAndDecryptMnemonic(testPin)
      expect(decrypted).toBe(mnemonic2)
    })

    it('should handle PIN change', async () => {
      ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

      // Store with old PIN
      const oldPin = '111111'
      await encryptAndStoreMnemonic(testMnemonic, oldPin, false)

      let storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
      let storedData = JSON.parse(storeCall[1])

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(storedData),
      })

      // Load with old PIN
      let decrypted = await loadAndDecryptMnemonic(oldPin)
      expect(decrypted).toBe(testMnemonic)

      // Re-encrypt with new PIN
      const newPin = '222222'
      await encryptAndStoreMnemonic(testMnemonic, newPin, false)

      storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[1]
      storedData = JSON.parse(storeCall[1])

      ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'BifoldMnemonicUser',
        password: JSON.stringify(storedData),
      })

      // Old PIN should fail
      await expect(loadAndDecryptMnemonic(oldPin)).rejects.toThrow('Incorrect PIN')

      // New PIN should work
      decrypted = await loadAndDecryptMnemonic(newPin)
      expect(decrypted).toBe(testMnemonic)
    })
  })

  describe('Error handling', () => {
    it('should handle null/undefined inputs gracefully', async () => {
      await expect(encryptMnemonic(null as any, testPin)).rejects.toThrow()
      await expect(encryptMnemonic(testMnemonic, null as any)).rejects.toThrow()
      await expect(decryptMnemonic(null as any, testPin)).rejects.toThrow()
    })

    it('should provide clear error messages', async () => {
      const encrypted = await encryptMnemonic(testMnemonic, testPin)

      // Wrong PIN
      try {
        await decryptMnemonic(encrypted, wrongPin)
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.message).toContain('Incorrect PIN')
      }

      // Keychain error
      ;(Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain locked'))

      try {
        await storeMnemonicInKeychain(encrypted, false)
        fail('Should have thrown error')
      } catch (error: any) {
        expect(error.message).toContain('Failed to store mnemonic in keychain')
        expect(error.message).toContain('Keychain locked')
      }
    })
  })

  describe('Plain text storage (SSI-compliant)', () => {
    describe('storeMnemonicPlain', () => {
      it('should store mnemonic in plain text', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

        const result = await storeMnemonicPlain(testMnemonic)

        expect(result).toBe(true)
        expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1)

        // Verify stored data structure
        const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
        const storedData = JSON.parse(call[1])
        expect(storedData.encryptedMnemonic.plainTextMnemonic).toBe(testMnemonic)
        expect(storedData.encryptedMnemonic.algorithm).toBe('none')
        expect(storedData.encryptedMnemonic.iterations).toBe(0)
      })

      it('should throw error if storage fails', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

        await expect(storeMnemonicPlain(testMnemonic)).rejects.toThrow('Failed to store plain text mnemonic')
      })
    })

    describe('storeMnemonicForBackup', () => {
      it('should store mnemonic for backup', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

        const result = await storeMnemonicForBackup(testMnemonic)

        expect(result).toBe(true)
        expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1)

        // Verify service name
        const call = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
        expect(call[2].service).toContain('Backup')

        // Verify stored data
        const storedData = JSON.parse(call[1])
        expect(storedData.mnemonic).toBe(testMnemonic)
        expect(storedData.storedAt).toBeDefined()
      })

      it('should throw error if storage fails', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

        await expect(storeMnemonicForBackup(testMnemonic)).rejects.toThrow('Failed to store mnemonic for backup')
      })
    })

    describe('loadMnemonicForBackup', () => {
      it('should load mnemonic from backup storage', async () => {
        const backupData = {
          mnemonic: testMnemonic,
          storedAt: Date.now(),
        }

        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          username: 'BackupMnemonic',
          password: JSON.stringify(backupData),
        })

        const mnemonic = await loadMnemonicForBackup()

        expect(mnemonic).toBe(testMnemonic)
        expect(Keychain.getGenericPassword).toHaveBeenCalledTimes(1)

        // Verify service name
        const call = (Keychain.getGenericPassword as jest.Mock).mock.calls[0]
        expect(call[0].service).toContain('Backup')
      })

      it('should return undefined if no backup exists', async () => {
        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false)

        const mnemonic = await loadMnemonicForBackup()

        expect(mnemonic).toBeUndefined()
      })

      it('should throw error if loading fails', async () => {
        ;(Keychain.getGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

        await expect(loadMnemonicForBackup()).rejects.toThrow('Failed to load mnemonic for backup')
      })
    })

    describe('deleteMnemonicForBackup', () => {
      it('should delete mnemonic from backup storage', async () => {
        ;(Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true)

        const result = await deleteMnemonicForBackup()

        expect(result).toBe(true)
        expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1)

        // Verify service name
        const call = (Keychain.resetGenericPassword as jest.Mock).mock.calls[0]
        expect(call[0].service).toContain('Backup')
      })

      it('should throw error if deletion fails', async () => {
        ;(Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'))

        await expect(deleteMnemonicForBackup()).rejects.toThrow('Failed to delete mnemonic from backup')
      })
    })

    describe('Plain text storage integration', () => {
      it('should complete full plain text store-load cycle', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

        // Store mnemonic
        await storeMnemonicForBackup(testMnemonic)

        // Get stored data
        const storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
        const storedData = JSON.parse(storeCall[1])

        // Mock load
        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          username: 'BackupMnemonic',
          password: JSON.stringify(storedData),
        })

        // Load mnemonic
        const mnemonic = await loadMnemonicForBackup()

        expect(mnemonic).toBe(testMnemonic)
      })

      it('should handle multiple backup storage cycles', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)

        // Store first mnemonic
        const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
        await storeMnemonicForBackup(mnemonic1)

        let storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0]
        let storedData = JSON.parse(storeCall[1])

        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          username: 'BackupMnemonic',
          password: JSON.stringify(storedData),
        })

        let loaded = await loadMnemonicForBackup()
        expect(loaded).toBe(mnemonic1)

        // Store second mnemonic (overwrite)
        const mnemonic2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
        await storeMnemonicForBackup(mnemonic2)

        storeCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[1]
        storedData = JSON.parse(storeCall[1])

        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
          username: 'BackupMnemonic',
          password: JSON.stringify(storedData),
        })

        loaded = await loadMnemonicForBackup()
        expect(loaded).toBe(mnemonic2)
      })

      it('should store and delete backup correctly', async () => {
        ;(Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true)
        ;(Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true)

        // Store mnemonic
        await storeMnemonicForBackup(testMnemonic)
        expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1)

        // Delete mnemonic
        await deleteMnemonicForBackup()
        expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1)

        // Verify deletion
        ;(Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false)
        const mnemonic = await loadMnemonicForBackup()
        expect(mnemonic).toBeUndefined()
      })
    })
  })
})
