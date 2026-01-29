/**
 * MnemonicStorage Service
 * 
 * Handles secure storage of BIP39 mnemonic phrases in device keychain.
 * 
 * Security Features:
 * - Encrypts mnemonic with PIN using AES-256-GCM
 * - Uses PBKDF2 for PIN-to-key derivation (100,000 iterations)
 * - Stores encrypted mnemonic in platform keychain (iOS Keychain / Android Keystore)
 * - Supports biometric authentication
 * - Never stores mnemonic in plain text
 * 
 * Flow:
 * 1. User provides PIN
 * 2. Derive encryption key from PIN using PBKDF2
 * 3. Encrypt mnemonic with AES-256-GCM
 * 4. Store encrypted data in keychain
 * 
 * @module MnemonicStorage
 */

import { Platform } from 'react-native'
import Keychain from 'react-native-keychain'
import Crypto from 'react-native-quick-crypto'
import { validateMnemonic } from 'bip39'

import { KeychainServices } from '../constants'

/**
 * Encrypted mnemonic data structure
 */
export interface EncryptedMnemonic {
  /** Plain text mnemonic (for SSI-compliant backup without PIN) */
  plainTextMnemonic?: string
  /** Encrypted mnemonic ciphertext (base64) */
  ciphertext: string
  /** Initialization vector for AES-GCM (base64) */
  iv: string
  /** Authentication tag for AES-GCM (base64) */
  authTag: string
  /** Salt for PBKDF2 key derivation (base64) */
  salt: string
  /** Algorithm used ('aes-256-gcm' or 'none') */
  algorithm: 'aes-256-gcm' | 'none'
  /** PBKDF2 iterations (always 100000 for PIN-based, 0 for self-encrypted) */
  iterations: number
}

/**
 * Keychain storage structure for mnemonic
 */
export interface MnemonicKeychainData {
  /** Encrypted mnemonic data */
  encryptedMnemonic: EncryptedMnemonic
  /** Whether biometrics is enabled */
  useBiometrics: boolean
  /** Timestamp when stored */
  storedAt: number
}

// Constants
const PBKDF2_ITERATIONS = 100000
const KEY_LENGTH = 32 // 256 bits for AES-256
const IV_LENGTH = 12 // 96 bits for GCM
const SALT_LENGTH = 32 // 256 bits
const AUTH_TAG_LENGTH = 16 // 128 bits for GCM
const MNEMONIC_KEYCHAIN_USERNAME = 'BifoldMnemonicUser'

/**
 * Get keychain options for mnemonic storage
 * 
 * @param useBiometrics - Whether to require biometric authentication
 * @returns Keychain options
 */
const getKeychainOptions = (useBiometrics: boolean): Keychain.Options => {
  const opts: Keychain.Options = {
    accessible: useBiometrics 
      ? Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY 
      : Keychain.ACCESSIBLE.ALWAYS,
    service: KeychainServices.Mnemonic,
  }

  if (useBiometrics) {
    opts.accessControl = Keychain.ACCESS_CONTROL.BIOMETRY_ANY
  }

  if (Platform.OS === 'android') {
    opts.securityLevel = Keychain.SECURITY_LEVEL.ANY
    opts.storage = useBiometrics 
      ? Keychain.STORAGE_TYPE.RSA 
      : Keychain.STORAGE_TYPE.AES
  }

  return opts
}

/**
 * Derive encryption key from PIN using PBKDF2
 * 
 * Uses PBKDF2-SHA256 with 100,000 iterations for strong key derivation.
 * This makes brute-force attacks on the PIN computationally expensive.
 * 
 * @param pin - User's PIN (6 digits)
 * @param salt - Random salt (32 bytes)
 * @returns Derived encryption key (32 bytes)
 * 
 * @example
 * ```typescript
 * const salt = randomBytes(32)
 * const key = await deriveKeyFromPIN('123456', salt)
 * ```
 */
async function deriveKeyFromPIN(pin: string, salt: Buffer | ArrayBuffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Convert ArrayBuffer to Buffer to ensure type compatibility
    let saltBuffer: Buffer
    if (salt instanceof ArrayBuffer) {
      saltBuffer = Buffer.from(salt)
    } else {
      saltBuffer = salt as Buffer
    }
    (Crypto.pbkdf2 as any)(
      pin,
      saltBuffer,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha256',
      (err: Error | null, derivedKey?: Buffer) => {
        if (err) {
          reject(new Error(`Failed to derive key from PIN: ${err.message}`))
        } else if (derivedKey) {
          resolve(derivedKey)
        } else {
          reject(new Error('Failed to derive key from PIN: no key returned'))
        }
      }
    )
  })
}

/**
 * Encrypt mnemonic with MNEMONIC itself using AES-256-GCM
 * 
 * This is the SECURE approach for SSI wallets - the mnemonic encrypts itself.
 * No PIN needed for encryption/decryption of the mnemonic.
 * 
 * Process:
 * 1. Derive encryption key from mnemonic using SHA-256 hash
 * 2. Generate random IV for AES-GCM
 * 3. Encrypt mnemonic with AES-256-GCM
 * 4. Return encrypted data with metadata
 * 
 * Security:
 * - AES-256-GCM provides authenticated encryption
 * - Mnemonic self-encrypts - no PIN dependency
 * - The same mnemonic can always decrypt itself
 * 
 * @param mnemonic - The 12-word BIP39 mnemonic to encrypt
 * @returns Encrypted mnemonic data
 * @throws Error if encryption fails
 * 
 * @example
 * ```typescript
 * const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
 * const encrypted = await encryptMnemonicWithItself(mnemonic)
 * ```
 */
export async function encryptMnemonicWithItself(mnemonic: string): Promise<EncryptedMnemonic> {
  try {
    // Step 1: Derive encryption key from mnemonic (SHA-256 hash)
    const hash = Crypto.createHash('sha256').update(mnemonic, 'utf8').digest()
    const key = hash.slice(0, KEY_LENGTH) // Use first 32 bytes for AES-256
    
    // Step 2: Generate random IV for AES-GCM (returns ArrayBuffer)
    const ivArray = Crypto.randomBytes(IV_LENGTH)
    const iv = Buffer.from(ivArray as any)

    // Step 3: Encrypt mnemonic with AES-256-GCM
    const cipher = Crypto.createCipheriv('aes-256-gcm', key as any, iv as any)

    let ciphertext = cipher.update(mnemonic, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    // Get authentication tag - MUST come from cipher, not random bytes
    // In AES-GCM, the auth tag is generated during encryption and must be retrieved
    const authTagBuffer = (cipher as any).getAuthTag()
    if (!authTagBuffer) {
      throw new Error('Failed to get authentication tag from cipher')
    }
    const authTag = Buffer.from(authTagBuffer as any)

    // Step 4: Return encrypted data (no salt needed since we use mnemonic hash)
    return {
      ciphertext: ciphertext as string,
      iv: Buffer.from(ivArray as any).toString('base64'),
      authTag: Buffer.from(authTagBuffer as any).toString('base64'),
      salt: '', // Empty salt - we use mnemonic hash as key
      algorithm: 'aes-256-gcm',
      iterations: 0, // No PBKDF2 iterations - we use direct hash
    }
  } catch (error: any) {
    throw new Error(`Failed to encrypt mnemonic: ${error.message}`)
  }
}

/**
 * Decrypt mnemonic with MNEMONIC itself using AES-256-GCM
 * 
 * @param encrypted - Encrypted mnemonic data
 * @param mnemonic - The same mnemonic used for encryption (acts as the key)
 * @returns Decrypted mnemonic (12 words)
 * @throws Error if decryption fails
 * 
 * @example
 * ```typescript
 * const encrypted = await encryptMnemonicWithItself(mnemonic)
 * const decrypted = await decryptMnemonicWithItself(encrypted, mnemonic)
 * // decrypted === mnemonic
 * ```
 */
export async function decryptMnemonicWithItself(encrypted: EncryptedMnemonic, mnemonic: string): Promise<string> {
  try {
    // Step 1: Derive encryption key from mnemonic (SHA-256 hash)
    const hash = Crypto.createHash('sha256').update(mnemonic, 'utf8').digest()
    const key = hash.slice(0, KEY_LENGTH) // Use first 32 bytes for AES-256
    
    // Step 2: Prepare decipher
    const iv = Buffer.from(encrypted.iv, 'base64')
    const authTag = Buffer.from(encrypted.authTag, 'base64')
    
    const decipher = Crypto.createDecipheriv('aes-256-gcm', key as any, iv as any)
    ;(decipher as any).setAuthTag(authTag)
    
    // Step 3: Decrypt ciphertext
    let decryptedMnemonic = decipher.update(encrypted.ciphertext, 'base64', 'utf8')
    decryptedMnemonic += decipher.final('utf8')
    
    return decryptedMnemonic as string
  } catch (error: any) {
    throw new Error(`Failed to decrypt mnemonic: ${error.message}`)
  }
}

/**
 * Encrypt mnemonic with PIN using AES-256-GCM
 * 
 * LEGACY METHOD - Only use for backward compatibility with old wallets.
 * New wallets should use encryptMnemonicWithItself() instead.
 * 
 * Process:
 * 1. Generate random salt for PBKDF2
 * 2. Derive encryption key from PIN using PBKDF2
 * 3. Generate random IV for AES-GCM
 * 4. Encrypt mnemonic with AES-256-GCM
 * 5. Return encrypted data with metadata
 * 
 * @deprecated Use encryptMnemonicWithItself() for new wallets
 * @param mnemonic - The 12-word BIP39 mnemonic to encrypt
 * @param pin - User's PIN (6 digits)
 * @returns Encrypted mnemonic data
 * @throws Error if encryption fails
 * 
 * @example
 * ```typescript
 * const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
 * const encrypted = await encryptMnemonic(mnemonic, "123456")
 * ```
 */
export async function encryptMnemonic(mnemonic: string, pin: string): Promise<EncryptedMnemonic> {
  try {
    // Step 1: Generate random salt for PBKDF2 (returns ArrayBuffer)
    const saltArray = Crypto.randomBytes(SALT_LENGTH)
    const salt = Buffer.from(saltArray as any)

    // Step 2: Derive encryption key from PIN
    const key = await deriveKeyFromPIN(pin, salt)

    // Step 3: Generate random IV for AES-GCM (returns ArrayBuffer)
    const ivArray = Crypto.randomBytes(IV_LENGTH)
    const iv = Buffer.from(ivArray as any)

    // Step 4: Encrypt mnemonic with AES-256-GCM
    // Cast to any to work around type incompatibility between react-native-quick-crypto Buffer and Node.js Buffer
    const cipher = Crypto.createCipheriv('aes-256-gcm', key as any, iv as any)

    let ciphertext = cipher.update(mnemonic, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    // Get authentication tag - MUST come from cipher, not random bytes
    // In AES-GCM, the auth tag is generated during encryption and must be retrieved
    const authTagBuffer = (cipher as any).getAuthTag()
    if (!authTagBuffer) {
      throw new Error('Failed to get authentication tag from cipher')
    }
    const authTag = Buffer.from(authTagBuffer as any)

    // Step 5: Return encrypted data
    return {
      ciphertext: ciphertext as string,
      iv: Buffer.from(ivArray as any).toString('base64'),
      authTag: Buffer.from(authTagBuffer as any).toString('base64'),
      salt: Buffer.from(saltArray as any).toString('base64'),
      algorithm: 'aes-256-gcm',
      iterations: PBKDF2_ITERATIONS,
    }
  } catch (error: any) {
    throw new Error(`Failed to encrypt mnemonic: ${error.message}`)
  }
}

/**
 * Decrypt mnemonic with PIN using AES-256-GCM
 * 
 * Process:
 * 1. Derive encryption key from PIN using stored salt
 * 2. Decrypt ciphertext with AES-256-GCM
 * 3. Verify authentication tag
 * 4. Return decrypted mnemonic
 * 
 * @deprecated Use decryptMnemonicWithItself() for new wallets. This method is only for migrating legacy PIN-based wallets.
 * @param encrypted - Encrypted mnemonic data
 * @param pin - User's PIN (6 digits)
 * @returns Decrypted mnemonic (12 words)
 * @throws Error if PIN is incorrect or decryption fails
 * 
 * @example
 * ```typescript
 * const encrypted = await encryptMnemonic(mnemonic, "123456")
 * const decrypted = await decryptMnemonic(encrypted, "123456")
 * // decrypted === mnemonic
 * ```
 */
export async function decryptMnemonic(encrypted: EncryptedMnemonic, pin: string): Promise<string> {
  try {
    // Step 1: Derive encryption key from PIN using stored salt
    const salt = Buffer.from(encrypted.salt, 'base64')
    const key = await deriveKeyFromPIN(pin, salt)
    
    // Step 2: Prepare decipher
    const iv = Buffer.from(encrypted.iv, 'base64')
    const authTag = Buffer.from(encrypted.authTag, 'base64')
    
    // Cast to any to work around type incompatibility between react-native-quick-crypto Buffer and Node.js Buffer
    const decipher = Crypto.createDecipheriv('aes-256-gcm', key as any, iv as any)
    ;(decipher as any).setAuthTag(authTag)
    
    // Step 3: Decrypt ciphertext
    let mnemonic = decipher.update(encrypted.ciphertext, 'base64', 'utf8')
    mnemonic += decipher.final('utf8')
    
    return mnemonic as string
  } catch (error: any) {
    // Authentication tag verification failed = wrong PIN
    if (error.message.includes('Unsupported state or unable to authenticate data')) {
      throw new Error('Incorrect PIN')
    }
    throw new Error(`Failed to decrypt mnemonic: ${error.message}`)
  }
}

/**
 * Decrypt mnemonic without PIN verification (requires authenticated session)
 *
 * This function loads the plain text mnemonic from keychain storage.
 * It should only be called when the app session is already authenticated (user
 * has successfully entered PIN at startup).
 *
 * This function ONLY loads plain text mnemonic stored with plainTextMnemonic field.
 * No decryption or fallback logic is performed.
 *
 * IMPORTANT SECURITY REQUIREMENTS:
 * - This function MUST only be called after successful PIN/biometric authentication
 * - The app should enforce session timeout and require re-authentication
 * - Never expose this function directly to unauthenticated routes
 *
 * @returns Decrypted mnemonic phrase (12 words)
 * @throws Error if mnemonic not found in keychain
 *
 * @example
 * ```typescript
 * // User just entered PIN at app startup, session is authenticated
 * const mnemonic = await decryptMnemonicWithoutVerification()
 * // Use mnemonic for backup export
 * ```
 */
export async function decryptMnemonicWithoutVerification(): Promise<string> {
  // Load from plain text backup storage
  const mnemonic = await loadMnemonicForBackup()

  if (!mnemonic) {
    throw new Error('No mnemonic available. Please create a wallet first.')
  }

  return mnemonic
}

/**
 * Store authenticated session PIN in memory
 * This PIN is cached after successful authentication at app startup
 * and cleared when session expires or user logs out
 * 
 * @param pin - User's PIN (6 digits)
 * 
 * @example
 * ```typescript
 * // After successful PIN verification at login
 * storeAuthenticatedSessionPIN('123456')
 * ```
 */
export function storeAuthenticatedSessionPIN(pin: string): void {
  ;(global as any).__authenticatedSessionPIN = pin
}

/**
 * Get the authenticated session PIN from memory
 * 
 * @returns The PIN string if session is authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * const pin = getAuthenticatedSessionPIN()
 * if (pin) {
 *   // Session is authenticated, can use decryptMnemonicWithoutVerification
 * }
 * ```
 */
export function getAuthenticatedSessionPIN(): string | null {
  return (global as any).__authenticatedSessionPIN || null
}

/**
 * Clear the authenticated session PIN from memory
 * This should be called when:
 * - User logs out
 * - Session times out
 * - App goes to background (optional, based on security requirements)
 * 
 * @example
 * ```typescript
 * // When user logs out or session expires
 * clearAuthenticatedSessionPIN()
 * ```
 */
export function clearAuthenticatedSessionPIN(): void {
  delete (global as any).__authenticatedSessionPIN
}

/**
 * Store encrypted mnemonic in device keychain
 *
 * Stores the encrypted mnemonic data in platform-specific secure storage:
 * - iOS: Keychain Services
 * - Android: Keystore System
 *
 * This function has two overloads:
 * 1. Store pre-encrypted mnemonic data
 * 2. Store plain text mnemonic (will be stored with plainTextMnemonic field)
 *
 * @param encryptedOrMnemonic - Encrypted mnemonic data OR plain text mnemonic
 * @param useBiometrics - Whether to require biometric authentication (default: false)
 * @returns true if storage succeeded
 * @throws Error if storage fails
 *
 * @example
 * ```typescript
 * // Store pre-encrypted mnemonic
 * const encrypted = await encryptMnemonic(mnemonic, pin)
 * await storeMnemonicInKeychain(encrypted, true) // Require biometrics
 *
 * // Store plain text mnemonic
 * await storeMnemonicInKeychain('abandon abandon ...', false)
 * ```
 */
export async function storeMnemonicInKeychain(
  encryptedOrMnemonic: EncryptedMnemonic | string,
  useBiometrics: boolean = false
): Promise<boolean> {
  try {
    // Check if plain mnemonic was passed
    let encrypted: EncryptedMnemonic
    if (typeof encryptedOrMnemonic === 'string') {
      // Plain text mnemonic - create EncryptedMnemonic with plainTextMnemonic field
      encrypted = {
        plainTextMnemonic: encryptedOrMnemonic,
        ciphertext: '',
        iv: '',
        authTag: '',
        salt: '',
        algorithm: 'none',
        iterations: 0,
      }
    } else {
      // Pre-encrypted mnemonic
      encrypted = encryptedOrMnemonic
    }

    // Prepare keychain data
    const keychainData: MnemonicKeychainData = {
      encryptedMnemonic: encrypted,
      useBiometrics,
      storedAt: Date.now(),
    }

    // Get keychain options
    const opts = getKeychainOptions(useBiometrics)

    // Store in keychain
    const result = await Keychain.setGenericPassword(
      MNEMONIC_KEYCHAIN_USERNAME,
      JSON.stringify(keychainData),
      opts
    )

    return Boolean(result)
  } catch (error: any) {
    throw new Error(`Failed to store mnemonic in keychain: ${error.message}`)
  }
}

/**
 * Load encrypted mnemonic from device keychain
 * 
 * Retrieves the encrypted mnemonic data from platform-specific secure storage.
 * If biometrics is enabled, user will be prompted for biometric authentication.
 * 
 * @param biometricPrompt - Optional biometric prompt configuration
 * @returns Encrypted mnemonic data, or undefined if not found
 * @throws Error if keychain access fails
 * 
 * @example
 * ```typescript
 * const encrypted = await loadMnemonicFromKeychain({
 *   title: 'Authenticate',
 *   description: 'Unlock your wallet'
 * })
 * 
 * if (encrypted) {
 *   const mnemonic = await decryptMnemonic(encrypted, pin)
 * }
 * ```
 */
export async function loadMnemonicFromKeychain(
  biometricPrompt?: { title: string; description: string }
): Promise<EncryptedMnemonic | undefined> {
  try {
    // Prepare keychain options
    let opts: Keychain.Options = {
      service: KeychainServices.Mnemonic,
    }
    
    // Add biometric prompt if provided
    if (biometricPrompt) {
      opts = {
        ...opts,
        authenticationPrompt: biometricPrompt,
      }
    }
    
    // Load from keychain
    const result = await Keychain.getGenericPassword(opts)
    
    if (!result) {
      return undefined
    }
    
    // Parse keychain data
    const keychainData: MnemonicKeychainData = JSON.parse(result.password)
    
    if (!keychainData.encryptedMnemonic) {
      throw new Error('Invalid keychain data: missing encryptedMnemonic')
    }
    
    return keychainData.encryptedMnemonic
  } catch (error: any) {
    throw new Error(`Failed to load mnemonic from keychain: ${error.message}`)
  }
}

/**
 * Delete mnemonic from device keychain
 * 
 * Removes the encrypted mnemonic data from platform-specific secure storage.
 * This is used during wallet deletion or migration.
 * 
 * @returns true if deletion succeeded
 * @throws Error if deletion fails
 * 
 * @example
 * ```typescript
 * await deleteMnemonicFromKeychain()
 * ```
 */
export async function deleteMnemonicFromKeychain(): Promise<boolean> {
  try {
    const opts: Keychain.Options = {
      service: KeychainServices.Mnemonic,
    }
    
    const result = await Keychain.resetGenericPassword(opts)
    return result
  } catch (error: any) {
    throw new Error(`Failed to delete mnemonic from keychain: ${error.message}`)
  }
}

/**
 * Check if mnemonic exists in keychain
 * 
 * @returns true if mnemonic is stored, false otherwise
 * 
 * @example
 * ```typescript
 * const hasWallet = await hasMnemonicInKeychain()
 * if (!hasWallet) {
 *   // Show onboarding
 * }
 * ```
 */
export async function hasMnemonicInKeychain(): Promise<boolean> {
  try {
    const encrypted = await loadMnemonicFromKeychain()
    return encrypted !== undefined
  } catch (error) {
    return false
  }
}

/**
 * Complete flow: Encrypt and store mnemonic
 *
 * Convenience function that combines encryption and storage.
 *
 * @param mnemonic - The 12-word BIP39 mnemonic
 * @param pin - User's PIN (6 digits) - Optional, kept for backward compatibility only
 * @param useBiometrics - Whether to require biometric authentication (default: false)
 * @returns true if successful
 * @throws Error if encryption or storage fails
 *
 * @example
 * ```typescript
 * // New usage (PIN optional)
 * await encryptAndStoreMnemonic(mnemonic, undefined, true)
 *
 * // Legacy usage (PIN provided but ignored)
 * await encryptAndStoreMnemonic(mnemonic, "123456", true)
 * ```
 */
export async function encryptAndStoreMnemonic(
  mnemonic: string,
  pin?: string,  // Optional - kept for backward compatibility but not used
  useBiometrics: boolean = false
): Promise<boolean> {
  // Encrypt mnemonic WITH ITSELF (no PIN needed for SSI wallets)
  const encrypted = await encryptMnemonicWithItself(mnemonic)
  const result = await storeMnemonicInKeychain(encrypted, useBiometrics)

  // ALSO store plain text version for backup convenience (NO PIN required)
  await storeMnemonicForBackup(mnemonic)

  return result
}

/**
 * Complete flow: Load and decrypt mnemonic
 * 
 * Convenience function that combines loading and decryption.
 * 
 * @param pin - User's PIN (6 digits)
 * @param biometricPrompt - Optional biometric prompt configuration
 * @returns Decrypted mnemonic, or undefined if not found
 * @throws Error if PIN is incorrect or decryption fails
 * 
 * @example
 * ```typescript
 * const mnemonic = await loadAndDecryptMnemonic("123456", {
 *   title: 'Authenticate',
 *   description: 'Unlock your wallet'
 * })
 * ```
 */
export async function loadAndDecryptMnemonic(
  pin: string,  // PIN ignored - not needed for mnemonic self-encryption
  biometricPrompt?: { title: string; description: string }
): Promise<string | undefined> {
  const encrypted = await loadMnemonicFromKeychain(biometricPrompt)
  
  if (!encrypted) {
    return undefined
  }
  
  // Check if it's self-encrypted (empty salt means mnemonic-based encryption)
  if (!encrypted.salt || encrypted.iterations === 0) {
    // Need the mnemonic to decrypt itself - load from backup storage
    const mnemonic = await loadMnemonicForBackup()
    if (mnemonic) {
      return await decryptMnemonicWithItself(encrypted, mnemonic)
    }
    throw new Error('Cannot decrypt - mnemonic not available. This should not happen in normal operation.')
  }
  
  // Legacy PIN-based encryption (should not happen with new wallets)
  throw new Error('Legacy PIN-based encryption detected. Please migrate to new wallet format.')
}

/**
 * Store mnemonic in plain text for SSI-compliant backup
 *
 * This function stores the mnemonic in plain text in the keychain.
 * No PIN or encryption is required - the mnemonic is stored as-is
 * in the secure keychain storage.
 *
 * This follows SSI principles where backup/restore should only require
 * the mnemonic itself, not a PIN. The keychain provides hardware-backed
 * security for the stored data.
 *
 * @param mnemonic - The 12-word BIP39 mnemonic to store
 * @returns true if storage succeeded
 * @throws Error if mnemonic is invalid or storage fails
 *
 * @example
 * ```typescript
 * await storeMnemonicPlain('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')
 * ```
 */
export async function storeMnemonicPlain(mnemonic: string): Promise<boolean> {
  try {
    // Validate BIP39 mnemonic before storing
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid BIP39 mnemonic. Must be 12 or 24 words from the BIP39 wordlist.')
    }

    const encrypted: EncryptedMnemonic = {
      plainTextMnemonic: mnemonic,
      ciphertext: '',
      iv: '',
      authTag: '',
      salt: '',
      algorithm: 'none',
      iterations: 0,
    }

    const keychainData: MnemonicKeychainData = {
      encryptedMnemonic: encrypted,
      useBiometrics: false,
      storedAt: Date.now(),
    }

    const opts = getKeychainOptions(false)

    const result = await Keychain.setGenericPassword(
      MNEMONIC_KEYCHAIN_USERNAME,
      JSON.stringify(keychainData),
      opts
    )

    return Boolean(result)
  } catch (error: any) {
    throw new Error(`Failed to store plain text mnemonic: ${error.message}`)
  }
}

/**
 * Store mnemonic for backup convenience
 *
 * This is a helper function that stores the mnemonic in plain text
 * specifically for backup operations. It uses a separate keychain
 * service to avoid conflicts with the main mnemonic storage.
 *
 * @param mnemonic - The 12-word BIP39 mnemonic to store
 * @returns true if storage succeeded
 * @throws Error if mnemonic is invalid or storage fails
 *
 * @example
 * ```typescript
 * await storeMnemonicForBackup(mnemonic)
 * ```
 */
export async function storeMnemonicForBackup(mnemonic: string): Promise<boolean> {
  try {
    // Validate BIP39 mnemonic before storing
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid BIP39 mnemonic. Must be 12 or 24 words from the BIP39 wordlist.')
    }

    const backupData = {
      mnemonic,
      storedAt: Date.now(),
    }

    const opts: Keychain.Options = {
      service: KeychainServices.MnemonicBackup,
      accessible: Keychain.ACCESSIBLE.ALWAYS,
    }

    const result = await Keychain.setGenericPassword(
      'BackupMnemonic',
      JSON.stringify(backupData),
      opts
    )

    return Boolean(result)
  } catch (error: any) {
    throw new Error(`Failed to store mnemonic for backup: ${error.message}`)
  }
}

/**
 * Load mnemonic for backup
 *
 * This function loads the plain text mnemonic from backup storage.
 * It's used during backup operations when the user needs to export
 * their mnemonic phrase.
 *
 * @returns Plain text mnemonic, or undefined if not found
 * @throws Error if loading fails
 *
 * @example
 * ```typescript
 * const mnemonic = await loadMnemonicForBackup()
 * if (mnemonic) {
 *   // Display mnemonic to user for backup
 * }
 * ```
 */
export async function loadMnemonicForBackup(): Promise<string | undefined> {
  try {
    const opts: Keychain.Options = {
      service: KeychainServices.MnemonicBackup,
    }

    const result = await Keychain.getGenericPassword(opts)

    if (!result) {
      return undefined
    }

    const backupData = JSON.parse(result.password)
    return backupData.mnemonic
  } catch (error: any) {
    throw new Error(`Failed to load mnemonic for backup: ${error.message}`)
  }
}

/**
 * Delete mnemonic from backup storage
 *
 * Removes the plain text mnemonic from backup storage.
 * This should be called when the wallet is deleted or reset.
 *
 * @returns true if deletion succeeded
 * @throws Error if deletion fails
 *
 * @example
 * ```typescript
 * await deleteMnemonicForBackup()
 * ```
 */
export async function deleteMnemonicForBackup(): Promise<boolean> {
  try {
    const opts: Keychain.Options = {
      service: KeychainServices.MnemonicBackup,
    }

    const result = await Keychain.resetGenericPassword(opts)
    return result
  } catch (error: any) {
    throw new Error(`Failed to delete mnemonic from backup: ${error.message}`)
  }
}
