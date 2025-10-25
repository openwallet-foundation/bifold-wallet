import {
  generateAndStoreHDWalletKey,
  loadHDWalletKey,
  getHDWalletRootKey,
  hasHDWalletKey,
  removeHDWalletKey,
} from '../../../src/services/hdWalletKeychain'

// Mock the keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  ACCESS_CONTROL: {
    BIOMETRY_ANY: 'BiometryAny',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
    ALWAYS: 'Always',
  },
}))

// Mock the HD wallet utils
jest.mock('../../../src/modules/hd-wallet/hdWalletUtils', () => ({
  createRootKeyFromMnemonicAsync: jest.fn(),
}))

import Keychain from 'react-native-keychain'
import { createRootKeyFromMnemonicAsync } from '../../../src/modules/hd-wallet/hdWalletUtils'

const mockSetGenericPassword = Keychain.setGenericPassword as jest.MockedFunction<typeof Keychain.setGenericPassword>
const mockGetGenericPassword = Keychain.getGenericPassword as jest.MockedFunction<typeof Keychain.getGenericPassword>
const mockResetGenericPassword = Keychain.resetGenericPassword as jest.MockedFunction<
  typeof Keychain.resetGenericPassword
>
const mockCreateRootKeyFromMnemonic = createRootKeyFromMnemonicAsync as jest.MockedFunction<
  typeof createRootKeyFromMnemonicAsync
>

describe('HD Wallet Keychain Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateAndStoreHDWalletKey', () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    const mockRootKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])

    it('should generate and store HD wallet key successfully', async () => {
      mockCreateRootKeyFromMnemonic.mockResolvedValue(mockRootKey)
      mockSetGenericPassword.mockResolvedValue({ service: 'test', storage: 'test' })

      const result = await generateAndStoreHDWalletKey(testMnemonic)

      expect(result).toBe(true)
      expect(mockCreateRootKeyFromMnemonic).toHaveBeenCalledWith(testMnemonic, '')
      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'WalletFauxHDWalletKeyUserName',
        expect.stringContaining('"rootKey"'),
        expect.objectContaining({
          service: 'secret.wallet.hdkey',
        })
      )
    })

    it('should store HD wallet key with biometrics when requested', async () => {
      mockCreateRootKeyFromMnemonic.mockResolvedValue(mockRootKey)
      mockSetGenericPassword.mockResolvedValue({ service: 'test', storage: 'test' })

      const result = await generateAndStoreHDWalletKey(testMnemonic, '', true)

      expect(result).toBe(true)
      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'WalletFauxHDWalletKeyUserName',
        expect.stringContaining('"rootKey"'),
        expect.objectContaining({
          service: 'secret.wallet.hdkey',
          accessible: 'WhenUnlockedThisDeviceOnly',
          accessControl: 'BiometryAny',
        })
      )
    })

    it('should fallback to non-biometric storage on biometric failure', async () => {
      mockCreateRootKeyFromMnemonic.mockResolvedValue(mockRootKey)
      mockSetGenericPassword
        .mockRejectedValueOnce(new Error('UserCancel'))
        .mockResolvedValueOnce({ service: 'test', storage: 'test' })

      const result = await generateAndStoreHDWalletKey(testMnemonic, '', true)

      expect(result).toBe(true)
      expect(mockSetGenericPassword).toHaveBeenCalledTimes(2)
    })

    it('should handle HD wallet key generation errors', async () => {
      mockCreateRootKeyFromMnemonic.mockImplementation(async () => {
        throw new Error('HD wallet generation failed')
      })

      await expect(generateAndStoreHDWalletKey(testMnemonic)).rejects.toThrow(
        'HD Wallet key generation failed: HD wallet generation failed'
      )
    })
  })

  describe('loadHDWalletKey', () => {
    it('should load HD wallet key successfully', async () => {
      const mockHDKeyData = {
        rootKey: 'AQIDBAUGBwg=', // Base64 of [1,2,3,4,5,6,7,8]
        derivationTimestamp: Date.now(),
      }

      mockGetGenericPassword.mockResolvedValue({
        username: 'WalletFauxHDWalletKeyUserName',
        password: JSON.stringify(mockHDKeyData),
        service: 'secret.wallet.hdkey',
        storage: 'test',
      })

      const result = await loadHDWalletKey()

      expect(result).toEqual(mockHDKeyData)
      expect(mockGetGenericPassword).toHaveBeenCalledWith({
        service: 'secret.wallet.hdkey',
      })
    })

    it('should return undefined when no HD wallet key exists', async () => {
      mockGetGenericPassword.mockResolvedValue(false)

      const result = await loadHDWalletKey()

      expect(result).toBeUndefined()
    })

    it('should throw error for invalid HD wallet key data', async () => {
      mockGetGenericPassword.mockResolvedValue({
        username: 'WalletFauxHDWalletKeyUserName',
        password: JSON.stringify({ invalid: 'data' }),
        service: 'secret.wallet.hdkey',
        storage: 'test',
      })

      await expect(loadHDWalletKey()).rejects.toThrow('Invalid HD wallet key data structure')
    })
  })

  describe('getHDWalletRootKey', () => {
    it('should return root key as Uint8Array', async () => {
      const originalRootKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
      const mockHDKeyData = {
        rootKey: Buffer.from(originalRootKey).toString('base64'),
        derivationTimestamp: Date.now(),
      }

      mockGetGenericPassword.mockResolvedValue({
        username: 'WalletFauxHDWalletKeyUserName',
        password: JSON.stringify(mockHDKeyData),
        service: 'secret.wallet.hdkey',
        storage: 'test',
      })

      const result = await getHDWalletRootKey()

      expect(result).toEqual(originalRootKey)
    })

    it('should return undefined when no HD wallet key exists', async () => {
      mockGetGenericPassword.mockResolvedValue(false)

      const result = await getHDWalletRootKey()

      expect(result).toBeUndefined()
    })
  })

  describe('hasHDWalletKey', () => {
    it('should return true when HD wallet key exists', async () => {
      const mockHDKeyData = {
        rootKey: 'AQIDBAUGBwg=',
        derivationTimestamp: Date.now(),
      }

      mockGetGenericPassword.mockResolvedValue({
        username: 'WalletFauxHDWalletKeyUserName',
        password: JSON.stringify(mockHDKeyData),
        service: 'secret.wallet.hdkey',
        storage: 'test',
      })

      const result = await hasHDWalletKey()

      expect(result).toBe(true)
    })

    it('should return false when no HD wallet key exists', async () => {
      mockGetGenericPassword.mockResolvedValue(false)

      const result = await hasHDWalletKey()

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      mockGetGenericPassword.mockRejectedValue(new Error('Keychain access error'))

      const result = await hasHDWalletKey()

      expect(result).toBe(false)
    })
  })

  describe('removeHDWalletKey', () => {
    it('should remove HD wallet key successfully', async () => {
      mockResetGenericPassword.mockResolvedValue(true)

      const result = await removeHDWalletKey()

      expect(result).toBe(true)
      expect(mockResetGenericPassword).toHaveBeenCalledWith({
        service: 'secret.wallet.hdkey',
      })
    })

    it('should return false on removal failure', async () => {
      mockResetGenericPassword.mockRejectedValue(new Error('Removal failed'))

      const result = await removeHDWalletKey()

      expect(result).toBe(false)
    })
  })
})
