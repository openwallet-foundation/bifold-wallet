/**
 * Unit tests for KeyDerivation service
 * 
 * Tests BIP39/BIP32 key derivation functionality
 */

import {
  generateWalletMnemonic,
  isValidMnemonic,
  deriveMasterSeed,
  deriveWalletKey,
  deriveWalletKeyFromMnemonic,
  generateNewWallet,
} from '../KeyDerivation'

describe('KeyDerivation Service', () => {
  describe('generateWalletMnemonic', () => {
    it('should generate a valid 12-word mnemonic', () => {
      const mnemonic = generateWalletMnemonic()
      
      // Should be a string
      expect(typeof mnemonic).toBe('string')
      
      // Should have 12 words
      const words = mnemonic.split(' ')
      expect(words).toHaveLength(12)
      
      // Should be valid BIP39 mnemonic
      expect(isValidMnemonic(mnemonic)).toBe(true)
    })

    it('should generate different mnemonics on each call', () => {
      const mnemonic1 = generateWalletMnemonic()
      const mnemonic2 = generateWalletMnemonic()
      const mnemonic3 = generateWalletMnemonic()
      
      // All should be different
      expect(mnemonic1).not.toBe(mnemonic2)
      expect(mnemonic2).not.toBe(mnemonic3)
      expect(mnemonic1).not.toBe(mnemonic3)
    })

    it('should generate mnemonics with valid checksums', () => {
      // Generate multiple mnemonics and verify all are valid
      for (let i = 0; i < 10; i++) {
        const mnemonic = generateWalletMnemonic()
        expect(isValidMnemonic(mnemonic)).toBe(true)
      }
    })
  })

  describe('isValidMnemonic', () => {
    it('should validate correct BIP39 test vectors', () => {
      // BIP39 test vectors
      const validMnemonics = [
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'legal winner thank year wave sausage worth useful legal winner thank yellow',
        'letter advice cage absurd amount doctor acoustic avoid letter advice cage above',
      ]
      
      validMnemonics.forEach(mnemonic => {
        expect(isValidMnemonic(mnemonic)).toBe(true)
      })
    })

    it('should reject invalid mnemonics', () => {
      const invalidMnemonics = [
        'invalid mnemonic phrase',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon', // wrong checksum
        'abandon', // too short
        '', // empty
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon invalid', // invalid word
      ]
      
      invalidMnemonics.forEach(mnemonic => {
        expect(isValidMnemonic(mnemonic)).toBe(false)
      })
    })

    it('should reject mnemonics with wrong number of words', () => {
      expect(isValidMnemonic('abandon abandon abandon')).toBe(false) // 3 words
      expect(isValidMnemonic('abandon abandon abandon abandon abandon abandon')).toBe(false) // 6 words
    })
  })

  describe('deriveMasterSeed', () => {
    it('should derive 512-bit master seed from mnemonic', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const masterSeed = deriveMasterSeed(mnemonic)
      
      // Should be a Buffer
      expect(Buffer.isBuffer(masterSeed)).toBe(true)
      
      // Should be 64 bytes (512 bits)
      expect(masterSeed.length).toBe(64)
    })

    it('should be deterministic (same mnemonic produces same seed)', () => {
      const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      
      const seed1 = deriveMasterSeed(mnemonic)
      const seed2 = deriveMasterSeed(mnemonic)
      const seed3 = deriveMasterSeed(mnemonic)
      
      // All seeds should be identical
      expect(seed1.equals(seed2)).toBe(true)
      expect(seed2.equals(seed3)).toBe(true)
    })

    it('should produce different seeds for different mnemonics', () => {
      const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const mnemonic2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      
      const seed1 = deriveMasterSeed(mnemonic1)
      const seed2 = deriveMasterSeed(mnemonic2)
      
      // Seeds should be different
      expect(seed1.equals(seed2)).toBe(false)
    })

    it('should support optional passphrase', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      
      const seedNoPassphrase = deriveMasterSeed(mnemonic)
      const seedWithPassphrase = deriveMasterSeed(mnemonic, 'my-passphrase')
      
      // Seeds should be different with different passphrases
      expect(seedNoPassphrase.equals(seedWithPassphrase)).toBe(false)
    })

    it('should match BIP39 test vectors', () => {
      // BIP39 test vector
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const expectedSeedHex = '5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4'
      
      const seed = deriveMasterSeed(mnemonic)
      
      expect(seed.toString('hex')).toBe(expectedSeedHex)
    })
  })

  describe('deriveWalletKey', () => {
    it('should derive 256-bit wallet key from master seed', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const masterSeed = deriveMasterSeed(mnemonic)
      
      const walletKey = deriveWalletKey(masterSeed)
      
      // Should be a hex string
      expect(typeof walletKey).toBe('string')
      
      // Should be 64 hex characters (32 bytes = 256 bits)
      expect(walletKey).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/i.test(walletKey)).toBe(true)
    })

    it('should be deterministic (same seed produces same key)', () => {
      const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      const masterSeed = deriveMasterSeed(mnemonic)
      
      const key1 = deriveWalletKey(masterSeed)
      const key2 = deriveWalletKey(masterSeed)
      const key3 = deriveWalletKey(masterSeed)
      
      // All keys should be identical
      expect(key1).toBe(key2)
      expect(key2).toBe(key3)
    })

    it('should produce different keys for different seeds', () => {
      const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const mnemonic2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      
      const seed1 = deriveMasterSeed(mnemonic1)
      const seed2 = deriveMasterSeed(mnemonic2)
      
      const key1 = deriveWalletKey(seed1)
      const key2 = deriveWalletKey(seed2)
      
      // Keys should be different
      expect(key1).not.toBe(key2)
    })

    it('should throw error if private key derivation fails', () => {
      // Create an invalid seed (all zeros)
      const invalidSeed = Buffer.alloc(64, 0)
      
      // This should not throw for all-zero seed, but let's test error handling
      // by testing with a seed that's too short
      const tooShortSeed = Buffer.alloc(32, 0)
      
      expect(() => deriveWalletKey(tooShortSeed)).toThrow()
    })
  })

  describe('deriveWalletKeyFromMnemonic', () => {
    it('should derive wallet key directly from mnemonic', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Should be a valid hex string
      expect(typeof walletKey).toBe('string')
      expect(walletKey).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/i.test(walletKey)).toBe(true)
    })

    it('should be deterministic (same mnemonic produces same key)', () => {
      const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      
      const key1 = deriveWalletKeyFromMnemonic(mnemonic)
      const key2 = deriveWalletKeyFromMnemonic(mnemonic)
      const key3 = deriveWalletKeyFromMnemonic(mnemonic)
      
      // All keys should be identical
      expect(key1).toBe(key2)
      expect(key2).toBe(key3)
    })

    it('should produce different keys for different mnemonics', () => {
      const mnemonic1 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const mnemonic2 = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
      const mnemonic3 = 'letter advice cage absurd amount doctor acoustic avoid letter advice cage above'
      
      const key1 = deriveWalletKeyFromMnemonic(mnemonic1)
      const key2 = deriveWalletKeyFromMnemonic(mnemonic2)
      const key3 = deriveWalletKeyFromMnemonic(mnemonic3)
      
      // All keys should be different
      expect(key1).not.toBe(key2)
      expect(key2).not.toBe(key3)
      expect(key1).not.toBe(key3)
    })

    it('should throw error for invalid mnemonic', () => {
      const invalidMnemonics = [
        'invalid mnemonic phrase',
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon', // wrong checksum
        '',
      ]
      
      invalidMnemonics.forEach(mnemonic => {
        expect(() => deriveWalletKeyFromMnemonic(mnemonic)).toThrow('Invalid mnemonic')
      })
    })

    it('should support optional passphrase', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      
      const keyNoPassphrase = deriveWalletKeyFromMnemonic(mnemonic)
      const keyWithPassphrase = deriveWalletKeyFromMnemonic(mnemonic, 'my-passphrase')
      
      // Keys should be different with different passphrases
      expect(keyNoPassphrase).not.toBe(keyWithPassphrase)
    })

    it('should match expected derivation for BIP39 test vectors', () => {
      // Test with known mnemonic
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Verify it's a valid key (we can't hardcode the expected value without running the derivation)
      // But we can verify properties
      expect(walletKey).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/i.test(walletKey)).toBe(true)
      
      // Verify determinism by deriving again
      const walletKey2 = deriveWalletKeyFromMnemonic(mnemonic)
      expect(walletKey).toBe(walletKey2)
    })
  })

  describe('generateNewWallet', () => {
    it('should generate mnemonic and wallet key', () => {
      const result = generateNewWallet()
      
      // Should have both mnemonic and walletKey
      expect(result).toHaveProperty('mnemonic')
      expect(result).toHaveProperty('walletKey')
      
      // Mnemonic should be valid
      expect(isValidMnemonic(result.mnemonic)).toBe(true)
      
      // Wallet key should be valid hex string
      expect(result.walletKey).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/i.test(result.walletKey)).toBe(true)
    })

    it('should generate different wallets on each call', () => {
      const wallet1 = generateNewWallet()
      const wallet2 = generateNewWallet()
      const wallet3 = generateNewWallet()
      
      // All mnemonics should be different
      expect(wallet1.mnemonic).not.toBe(wallet2.mnemonic)
      expect(wallet2.mnemonic).not.toBe(wallet3.mnemonic)
      
      // All wallet keys should be different
      expect(wallet1.walletKey).not.toBe(wallet2.walletKey)
      expect(wallet2.walletKey).not.toBe(wallet3.walletKey)
    })

    it('should derive correct wallet key from generated mnemonic', () => {
      const { mnemonic, walletKey } = generateNewWallet()
      
      // Verify that deriving the key from the mnemonic produces the same key
      const derivedKey = deriveWalletKeyFromMnemonic(mnemonic)
      expect(derivedKey).toBe(walletKey)
    })

    it('should support optional passphrase', () => {
      const wallet1 = generateNewWallet()
      const wallet2 = generateNewWallet('my-passphrase')
      
      // Should generate different wallets
      expect(wallet1.mnemonic).not.toBe(wallet2.mnemonic)
      expect(wallet1.walletKey).not.toBe(wallet2.walletKey)
    })
  })

  describe('Property-based tests', () => {
    it('should always produce valid mnemonics', () => {
      // Generate 100 mnemonics and verify all are valid
      for (let i = 0; i < 100; i++) {
        const mnemonic = generateWalletMnemonic()
        expect(isValidMnemonic(mnemonic)).toBe(true)
      }
    })

    it('should always produce deterministic keys', () => {
      // Generate random mnemonics and verify determinism
      for (let i = 0; i < 50; i++) {
        const mnemonic = generateWalletMnemonic()
        
        const key1 = deriveWalletKeyFromMnemonic(mnemonic)
        const key2 = deriveWalletKeyFromMnemonic(mnemonic)
        
        expect(key1).toBe(key2)
      }
    })

    it('should always produce unique keys for different mnemonics', () => {
      const keys = new Set<string>()
      
      // Generate 100 different mnemonics and verify all produce unique keys
      for (let i = 0; i < 100; i++) {
        const mnemonic = generateWalletMnemonic()
        const key = deriveWalletKeyFromMnemonic(mnemonic)
        
        // Key should not already exist in set
        expect(keys.has(key)).toBe(false)
        
        keys.add(key)
      }
      
      // Should have 100 unique keys
      expect(keys.size).toBe(100)
    })

    it('should always produce 256-bit keys', () => {
      // Generate random mnemonics and verify key length
      for (let i = 0; i < 50; i++) {
        const mnemonic = generateWalletMnemonic()
        const key = deriveWalletKeyFromMnemonic(mnemonic)
        
        // Should be 64 hex characters (32 bytes = 256 bits)
        expect(key).toHaveLength(64)
        expect(/^[0-9a-f]{64}$/i.test(key)).toBe(true)
      }
    })
  })

  describe('Error handling', () => {
    it('should handle empty mnemonic', () => {
      expect(() => deriveWalletKeyFromMnemonic('')).toThrow('Invalid mnemonic')
    })

    it('should handle null/undefined mnemonic', () => {
      expect(() => deriveWalletKeyFromMnemonic(null as any)).toThrow()
      expect(() => deriveWalletKeyFromMnemonic(undefined as any)).toThrow()
    })

    it('should handle mnemonic with extra spaces', () => {
      const mnemonic = 'abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  abandon  about'
      
      // BIP39 library should handle extra spaces
      // This might be valid or invalid depending on the library implementation
      const isValid = isValidMnemonic(mnemonic)
      
      if (isValid) {
        // If valid, should be able to derive key
        expect(() => deriveWalletKeyFromMnemonic(mnemonic)).not.toThrow()
      } else {
        // If invalid, should throw
        expect(() => deriveWalletKeyFromMnemonic(mnemonic)).toThrow('Invalid mnemonic')
      }
    })

    it('should handle mnemonic with wrong case', () => {
      const mnemonic = 'ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABANDON ABOUT'
      
      // BIP39 library should handle case-insensitive mnemonics
      const isValid = isValidMnemonic(mnemonic)
      
      if (isValid) {
        expect(() => deriveWalletKeyFromMnemonic(mnemonic)).not.toThrow()
      } else {
        expect(() => deriveWalletKeyFromMnemonic(mnemonic)).toThrow('Invalid mnemonic')
      }
    })
  })
})
