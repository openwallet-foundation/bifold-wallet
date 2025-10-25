import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

/**
 * BIP39 utilities that don't depend on xHD-Wallet-API
 * These can be tested separately without ES module issues
 */

/**
 * Validates a BIP39 mnemonic phrase
 * @param mnemonic The mnemonic phrase to validate
 * @returns True if valid, false otherwise
 */

export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic, wordlist)
}

/**
 * Generates a new BIP39 mnemonic phrase
 * @param strength Entropy strength in bits (128, 160, 192, 224, 256)
 * @returns Generated mnemonic phrase
 */

export function generateMnemonic(strength: number = 256): string {
  return bip39.generateMnemonic(wordlist, strength)
}

/**
 * Convert mnemonic to seed (returns Uint8Array for React Native compatibility)
 * @param mnemonic BIP39 mnemonic phrase
 * @param passphrase Optional passphrase (empty string by default)
 * @returns Seed as Uint8Array (64 bytes)
 */

export function mnemonicToSeedSync(): Uint8Array {
  // @scure/bip39 provides mnemonicToSeedSync, but async is preferred for React Native
  throw new Error('mnemonicToSeedSync is not supported; use mnemonicToSeed (async) instead.')
}

export async function mnemonicToSeed(mnemonic: string, passphrase: string = ''): Promise<Uint8Array> {
  return bip39.mnemonicToSeed(mnemonic, passphrase)
}
