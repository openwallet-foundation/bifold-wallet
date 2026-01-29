/**
 * KeyDerivation Service
 * 
 * Implements BIP39/BIP32 key derivation for SSI-compliant wallet backup.
 * 
 * Flow:
 * 1. Generate 12-word BIP39 mnemonic
 * 2. Derive 512-bit master seed using BIP39 PBKDF2
 * 3. Derive wallet key using BIP32 path m/44'/0'/0'/0/0
 * 
 * Security:
 * - Deterministic: Same mnemonic always produces same wallet key
 * - One-way: Cannot derive mnemonic from wallet key
 * - Standard: Compatible with BIP39/BIP32 wallets
 * - Secure: Uses PBKDF2-SHA512 and ECDSA
 */

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39'
import { HDKey } from '@scure/bip32'

/**
 * BIP32 derivation path for wallet key
 * m/44'/0'/0'/0/0
 * - m/44' = BIP44 purpose
 * - 0' = coin type (0 for Bitcoin, we use 0 for SSI)
 * - 0' = account
 * - 0 = external chain
 * - 0 = address index
 */
const WALLET_DERIVATION_PATH = "m/44'/0'/0'/0/0"

/**
 * Generate a new BIP39 mnemonic phrase
 * 
 * @returns 12-word mnemonic phrase (128 bits of entropy)
 * 
 * @example
 * ```typescript
 * const mnemonic = generateWalletMnemonic()
 * // Returns: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
 * ```
 */
export function generateWalletMnemonic(): string {
  // 128 bits = 12 words
  // 256 bits = 24 words (we use 12 for simplicity and user convenience)
  return generateMnemonic(128)
}

/**
 * Validate a BIP39 mnemonic phrase
 * 
 * Checks:
 * - Correct number of words (12)
 * - Valid BIP39 words
 * - Valid checksum
 * 
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * ```typescript
 * const valid = isValidMnemonic("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
 * // Returns: true
 * 
 * const invalid = isValidMnemonic("invalid mnemonic phrase")
 * // Returns: false
 * ```
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic)
}

/**
 * Derive 512-bit master seed from mnemonic using BIP39 PBKDF2
 * 
 * Uses PBKDF2-SHA512 with 2048 iterations
 * Salt: "mnemonic" + passphrase
 * 
 * @param mnemonic - The 12-word BIP39 mnemonic
 * @param passphrase - Optional passphrase for additional security (default: empty)
 * @returns 512-bit master seed as Buffer
 * 
 * @example
 * ```typescript
 * const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
 * const masterSeed = deriveMasterSeed(mnemonic)
 * // Returns: Buffer of 64 bytes (512 bits)
 * ```
 */
export function deriveMasterSeed(mnemonic: string, passphrase: string = ''): Buffer {
  // BIP39 standard: PBKDF2-SHA512 with 2048 iterations
  // Salt: "mnemonic" + passphrase
  return mnemonicToSeedSync(mnemonic, passphrase)
}

/**
 * Derive wallet key from master seed using BIP32
 * 
 * Uses BIP32 hierarchical deterministic derivation
 * Path: m/44'/0'/0'/0/0
 * 
 * @param masterSeed - The 512-bit master seed from BIP39
 * @returns 256-bit wallet key as hex string (for Aries Askar)
 * @throws Error if private key derivation fails
 * 
 * @example
 * ```typescript
 * const masterSeed = deriveMasterSeed(mnemonic)
 * const walletKey = deriveWalletKey(masterSeed)
 * // Returns: "a0b1c2d3e4f5..." (64 hex characters = 32 bytes = 256 bits)
 * ```
 */
export function deriveWalletKey(masterSeed: Buffer): string {
  // Create root key from master seed using @scure/bip32
  const root = HDKey.fromMasterSeed(masterSeed)

  // Derive child key using BIP32 path
  const child = root.derive(WALLET_DERIVATION_PATH)

  // Extract private key (32 bytes = 256 bits)
  if (!child.privateKey) {
    throw new Error('Failed to derive private key from master seed')
  }

  // Convert to hex string for Aries Askar
  return Buffer.from(child.privateKey).toString('hex')
}

/**
 * Complete key derivation flow: Mnemonic → Master Seed → Wallet Key
 * 
 * This is the main function that combines all steps:
 * 1. Validate mnemonic checksum
 * 2. Derive master seed using BIP39 PBKDF2
 * 3. Derive wallet key using BIP32
 * 
 * @param mnemonic - The 12-word BIP39 mnemonic
 * @param passphrase - Optional passphrase for additional security (default: empty)
 * @returns Wallet key for Aries Askar (256-bit hex string)
 * @throws Error if mnemonic is invalid or key derivation fails
 * 
 * @example
 * ```typescript
 * const mnemonic = generateWalletMnemonic()
 * const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
 * 
 * // Use wallet key to create/open Aries wallet
 * await agent.wallet.create({
 *   id: 'walletId',
 *   key: walletKey
 * })
 * ```
 */
export function deriveWalletKeyFromMnemonic(mnemonic: string, passphrase: string = ''): string {
  // Step 1: Validate mnemonic
  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic: checksum verification failed')
  }
  
  // Step 2: Derive master seed (BIP39)
  const masterSeed = deriveMasterSeed(mnemonic, passphrase)
  
  // Step 3: Derive wallet key (BIP32)
  const walletKey = deriveWalletKey(masterSeed)
  
  return walletKey
}

/**
 * Type definitions for KeyDerivation service
 */
export interface KeyDerivationResult {
  walletKey: string
  mnemonic: string
}

/**
 * Generate a new wallet with mnemonic and derived key
 * 
 * Convenience function that combines mnemonic generation and key derivation
 * 
 * @param passphrase - Optional passphrase for additional security (default: empty)
 * @returns Object containing mnemonic and derived wallet key
 * 
 * @example
 * ```typescript
 * const { mnemonic, walletKey } = generateNewWallet()
 * 
 * // Display mnemonic to user for backup
 * console.log('Write down your recovery phrase:', mnemonic)
 * 
 * // Use wallet key to create wallet
 * await agent.wallet.create({ id: 'walletId', key: walletKey })
 * ```
 */
export function generateNewWallet(passphrase: string = ''): KeyDerivationResult {
  const mnemonic = generateWalletMnemonic()
  const walletKey = deriveWalletKeyFromMnemonic(mnemonic, passphrase)
  
  return {
    mnemonic,
    walletKey,
  }
}
