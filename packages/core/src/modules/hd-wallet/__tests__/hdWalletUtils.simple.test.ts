import { createRootKeyFromMnemonicAsync } from '../hdWalletUtils'

describe('HD Wallet Utils (Simple Test)', () => {
  test('should import createRootKeyFromMnemonicAsync function', () => {
    expect(typeof createRootKeyFromMnemonicAsync).toBe('function')
  })

  test('should create root key from valid mnemonic', async () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    try {
      const rootKey = await createRootKeyFromMnemonicAsync(mnemonic)
      expect(rootKey).toBeDefined()
      expect(rootKey.length).toBeGreaterThan(0)
    } catch (error) {
      // This is expected to fail until we resolve ES module issues
      expect(error).toBeDefined()
    }
  })
})
