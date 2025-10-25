import { KeychainServices } from '../constants'
import { createRootKeyFromMnemonicAsync } from '../modules/hd-wallet/hdWalletUtils'
import { fromBase64, toBase64 } from '../utils/base64'
import Keychain from 'react-native-keychain'
import { optionsForKeychainAccess } from './keychain'

/**
 * HD Wallet Key Management Service
 * Handles secure storage and retrieval of HD wallet root keys
 */

const hdWalletKeyFauxUserName = 'WalletFauxHDWalletKeyUserName'

export interface WalletHDKey {
  rootKey: string // Base64 encoded root key
  derivationTimestamp: number // When the key was derived
}

/**
 * Generates and stores an HD wallet root key from mnemonic
 * This should be called during mnemonic creation/import
 */
export const generateAndStoreHDWalletKey = async (
  mnemonic: string,
  passphrase: string = '',
  useBiometrics = false
): Promise<boolean> => {
  try {
    // Generate root key from mnemonic using HD wallet API (async)
    const rootKey = await createRootKeyFromMnemonicAsync(mnemonic, passphrase)

    // Convert Uint8Array to base64 string for storage (React Native safe)
    const rootKeyBase64 = toBase64(rootKey)

    // Create HD key data structure
    const hdKeyData: WalletHDKey = {
      rootKey: rootKeyBase64,
      derivationTimestamp: Date.now(),
    }

    // Store securely in keychain
    const opts = optionsForKeychainAccess(KeychainServices.HDWalletKey, useBiometrics)
    const hdKeyAsString = JSON.stringify(hdKeyData)

    const result = await Keychain.setGenericPassword(hdWalletKeyFauxUserName, hdKeyAsString, opts)
    return Boolean(result)
  } catch (error: any) {
    // If biometrics fail, try without biometrics
    if (
      useBiometrics &&
      (error.message.includes('UserCancel') ||
        error.message.includes('BiometryNotAvailable') ||
        error.message.includes('BiometryNotEnrolled') ||
        error.message.includes('AuthenticationFailed'))
    ) {
      return await generateAndStoreHDWalletKey(mnemonic, passphrase, false)
    }

    // Create a more detailed error message
    const detailedError = new Error(
      `HD Wallet key generation failed: ${error.message} (Code: ${error.code || 'unknown'})`
    )
    detailedError.stack = error.stack
    throw detailedError
  }
}

/**
 * Loads the stored HD wallet root key
 */
export const loadHDWalletKey = async (title?: string, description?: string): Promise<WalletHDKey | undefined> => {
  let opts: Keychain.Options = {
    service: KeychainServices.HDWalletKey,
  }

  if (title && description) {
    opts = {
      ...opts,
      authenticationPrompt: {
        title,
        description,
      },
    }
  }

  try {
    const result = await Keychain.getGenericPassword(opts)

    if (!result) {
      return undefined
    }

    const hdKeyData = JSON.parse(result.password) as WalletHDKey

    // Validate the loaded data
    if (!hdKeyData.rootKey || !hdKeyData.derivationTimestamp) {
      throw new Error('Invalid HD wallet key data structure')
    }

    return hdKeyData
  } catch (error: any) {
    throw new Error(`Failed to load HD wallet key: ${error.message}`)
  }
}

/**
 * Gets the root key as Uint8Array for cryptographic operations
 */
export const getHDWalletRootKey = async (title?: string, description?: string): Promise<Uint8Array | undefined> => {
  const hdKeyData = await loadHDWalletKey(title, description)

  if (!hdKeyData) {
    return undefined
  }

  // Convert base64 back to Uint8Array (React Native safe)
  return fromBase64(hdKeyData.rootKey)
}

/**
 * Checks if an HD wallet key exists in storage
 */
export const hasHDWalletKey = async (): Promise<boolean> => {
  try {
    const hdKeyData = await loadHDWalletKey()
    return hdKeyData !== undefined
  } catch (error) {
    return false
  }
}

/**
 * Removes the HD wallet key from storage
 * This should be called when resetting/removing the wallet
 */
export const removeHDWalletKey = async (): Promise<boolean> => {
  try {
    const opts: Keychain.Options = {
      service: KeychainServices.HDWalletKey,
    }

    const result = await Keychain.resetGenericPassword(opts)
    return Boolean(result)
  } catch (error) {
    return false
  }
}
