import { mnemonicToSeed } from '../bip39Utils'
import { validateMnemonic, generateMnemonic } from '../bip39Utils'

describe('BIP39 Utilities', () => {
  // Test mnemonic from the xHD-Wallet-API test file
  const testMnemonic =
    'salon zoo engage submit smile frost later decide wing sight chaos renew lizard rely canal coral scene hobby scare step bus leaf tobacco slice'

  describe('validateMnemonic', () => {
    it('should validate a correct mnemonic', () => {
      expect(validateMnemonic(testMnemonic)).toBe(true)
    })

    it('should reject an incorrect mnemonic', () => {
      expect(validateMnemonic('invalid mnemonic phrase')).toBe(false)
    })
  })

  describe('generateMnemonic', () => {
    it('should generate a valid 24-word mnemonic (256 bits)', () => {
      const mnemonic = generateMnemonic(256)

      expect(validateMnemonic(mnemonic)).toBe(true)
      expect(mnemonic.split(' ')).toHaveLength(24)
    })

    it('should generate a valid 12-word mnemonic (128 bits)', () => {
      const mnemonic = generateMnemonic(128)

      expect(validateMnemonic(mnemonic)).toBe(true)
      expect(mnemonic.split(' ')).toHaveLength(12)
    })
  })

  describe('mnemonicToSeed', () => {
    it('should convert mnemonic to 64-byte seed', async () => {
      const seed = await mnemonicToSeed(testMnemonic)
      expect(seed).toBeInstanceOf(Uint8Array)
      expect(seed).toHaveLength(64)
    })

    it('should produce different seeds with different passphrases', async () => {
      const seed1 = await mnemonicToSeed(testMnemonic, '')
      const seed2 = await mnemonicToSeed(testMnemonic, 'passphrase')

      expect(seed1).not.toEqual(seed2)
    })

    it('should produce consistent seeds for same mnemonic and passphrase', async () => {
      const seed1 = await mnemonicToSeed(testMnemonic, 'test')
      const seed2 = await mnemonicToSeed(testMnemonic, 'test')

      expect(seed1).toEqual(seed2)
    })
  })
})
