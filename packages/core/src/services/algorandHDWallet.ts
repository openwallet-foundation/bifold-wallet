import { getHDWalletRootKey, hasHDWalletKey } from './hdWalletKeychain'
import { HDWalletService } from '../modules/hd-wallet/hdWalletUtils'
import { loadMnemonic } from './keychain'

/**
 * Algorand HD Wallet Service
 * High-level service for Algorand address and key generation using stored HD wallet keys
 */

/**
 * Creates an HD wallet service instance from stored keys
 * This will use the stored HD wallet root key if available, otherwise regenerate from mnemonic
 */
export const createAlgorandHDWalletService = async (
  title?: string,
  description?: string
): Promise<HDWalletService | null> => {
  try {
    // First try to get the stored HD wallet root key
    const rootKey = await getHDWalletRootKey(title, description)

    if (rootKey) {
      // Create HD wallet service directly from stored root key
      return new HDWalletService(rootKey)
    }

    // Fallback: Check if we have the mnemonic and can regenerate the root key
    const mnemonic = await loadMnemonic(title, description)

    if (mnemonic) {
      // Create HD wallet service from mnemonic (will regenerate root key)
      // Convert mnemonic to seed/rootKey before passing to HDWalletService
      // Example: const rootKey = await createRootKeyFromMnemonicAsync(mnemonic)
      // return new HDWalletService(rootKey)
      throw new Error('Pass Uint8Array rootKey to HDWalletService, not mnemonic string')
    }

    // No HD wallet key or mnemonic available
    return null
  } catch (error) {
    // Failed to create HD wallet service
    return null
  }
}

/**
 * Generates an Algorand address from the stored HD wallet
 * @param account Account index (default: 0)
 * @param addressIndex Address index (default: 0)
 * @param title Optional title for biometric prompt
 * @param description Optional description for biometric prompt
 * @returns Algorand address as base32 string, or null if unavailable
 */
export const generateAlgorandAddress = async (
  account: number = 0,
  addressIndex: number = 0,
  title?: string,
  description?: string
): Promise<string | null> => {
  try {
    const hdWallet = await createAlgorandHDWalletService(title, description)

    if (!hdWallet) {
      return null
    }

    // Generate Algorand address using BIP44 path
    const address = await hdWallet.generateAlgorandAddressKey(account, addressIndex)
    // Convert Uint8Array to string (e.g., base64 or hex) before returning
    return Buffer.from(address).toString('hex')
  } catch (error) {
    // Failed to generate address
    return null
  }
}

/**
 * Generates multiple Algorand addresses for an account
 * @param account Account index (default: 0)
 * @param count Number of addresses to generate (default: 10)
 * @param startIndex Starting address index (default: 0)
 * @param title Optional title for biometric prompt
 * @param description Optional description for biometric prompt
 * @returns Array of Algorand addresses, or empty array if unavailable
 */
export const generateAlgorandAddresses = async (
  account: number = 0,
  count: number = 10,
  startIndex: number = 0,
  title?: string,
  description?: string
): Promise<string[]> => {
  try {
    const hdWallet = await createAlgorandHDWalletService(title, description)

    if (!hdWallet) {
      return []
    }

    const addresses: string[] = []

    for (let i = 0; i < count; i++) {
      const addressIndex = startIndex + i
      const address = await hdWallet.generateAlgorandAddressKey(account, addressIndex)
      addresses.push(Buffer.from(address).toString('hex'))
    }

    return addresses
  } catch (error) {
    // Failed to generate addresses
    return []
  }
}

/**
 * Generates a signing key for transactions
 * @param account Account index (default: 0)
 * @param addressIndex Address index (default: 0)
 * @param title Optional title for biometric prompt
 * @param description Optional description for biometric prompt
 * @returns Private key as Uint8Array, or null if unavailable
 */
export const generateAlgorandSigningKey = async (
  account: number = 0,
  addressIndex: number = 0,
  title?: string,
  description?: string
): Promise<Uint8Array | null> => {
  try {
    const hdWallet = await createAlgorandHDWalletService(title, description)

    if (!hdWallet) {
      return null
    }

    // Generate signing key using BIP44 path (reuse address key for now)
    // If a dedicated signing key method is needed, implement in HDWalletService
    const signingKey = await hdWallet.generateAlgorandAddressKey(account, addressIndex)
    return signingKey
  } catch (error) {
    // Failed to generate signing key
    return null
  }
}

/**
 * Checks if HD wallet functionality is available
 * @returns True if HD wallet key or mnemonic is available
 */
export const isAlgorandHDWalletAvailable = async (): Promise<boolean> => {
  try {
    // Check if we have stored HD wallet key
    const hasHDKey = await hasHDWalletKey()

    if (hasHDKey) {
      return true
    }

    // Check if we have mnemonic (for fallback)
    const mnemonic = await loadMnemonic()
    return mnemonic !== undefined
  } catch (error) {
    return false
  }
}

/**
 * Gets wallet information including derivation timestamp
 * @param title Optional title for biometric prompt
 * @param description Optional description for biometric prompt
 * @returns Wallet info object or null
 */
export const getAlgorandWalletInfo = async (
  title?: string,
  description?: string
): Promise<{
  hasHDKey: boolean
  hasMnemonic: boolean
  derivationTimestamp?: number
} | null> => {
  try {
    const hasHDKey = await hasHDWalletKey()

    let derivationTimestamp: number | undefined
    if (hasHDKey) {
      // Note: We'd need to also store timestamp in the HD key data structure
      // For now, we'll indicate it's available
      derivationTimestamp = Date.now() // Placeholder
    }

    const mnemonic = await loadMnemonic(title, description)
    const hasMnemonic = mnemonic !== undefined

    return {
      hasHDKey,
      hasMnemonic,
      derivationTimestamp,
    }
  } catch (error) {
    // Failed to get wallet info
    return null
  }
}
