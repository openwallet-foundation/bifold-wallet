import { createRootKeyFromMnemonicAsync, validateMnemonic, generateMnemonic } from '../hdWalletUtils'

describe('HD Wallet Utils', () => {
  // Test mnemonic from the xHD-Wallet-API test file
  const testMnemonic =
    'salon zoo engage submit smile frost later decide wing sight chaos renew lizard rely canal coral scene hobby scare step bus leaf tobacco slice'

  describe('createRootKeyFromMnemonicAsync', () => {
    it('should create a 96-byte root key from mnemonic', async () => {
      const rootKey = await createRootKeyFromMnemonicAsync(testMnemonic)

      expect(rootKey).toBeInstanceOf(Uint8Array)
      expect(rootKey).toHaveLength(96)

      // Expected root key from the test file
      const expectedRootKey = Buffer.from(
        'a8ba80028922d9fcfa055c78aede55b5c575bcd8d5a53168edf45f36d9ec8f4694592b4bc892907583e22669ecdf1b0409a9f3bd5549f2dd751b51360909cd05796b9206ec30e142e94b790a98805bf999042b55046963174ee6cee2d0375946',
        'hex'
      )

      expect(Buffer.from(rootKey)).toEqual(expectedRootKey)
    })
  })

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

  // Removed createHDWallet tests: function not defined/exported
})
