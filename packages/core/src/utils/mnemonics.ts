/**
 * BIP39 mnemonic utilities for wallet seed phrase management
 *
 * Uses the @scure/bip39 library for proper mnemonic phrase generation,
 * validation, and entropy management according to BIP39 specification.
 */

import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

/**
 * Generate a new BIP39 mnemonic phrase (synchronous version for compatibility)
 * @param strength Entropy strength in bits (128 = 12 words, 256 = 24 words)
 * @returns A valid BIP39 mnemonic phrase
 */
export const generateMnemonicPhrase = (strength: number = 256): string => {
  // Generate entropy bytes
  const entropyBytes = strength / 8
  const entropy = crypto.getRandomValues(new Uint8Array(entropyBytes))

  // Generate mnemonic from entropy using @scure/bip39
  return bip39.entropyToMnemonic(entropy, wordlist)
}

/**
 * Generate a cryptographically secure BIP39 mnemonic phrase (async version)
 * @param strength Entropy strength in bits (128 = 12 words, 256 = 24 words)
 * @returns Promise resolving to a valid BIP39 mnemonic phrase
 */
export const generateSecureMnemonic = async (strength: number = 256): Promise<string> => {
  try {
    // Generate entropy bytes
    const entropyBytes = strength / 8
    const entropy = crypto.getRandomValues(new Uint8Array(entropyBytes))

    // Generate mnemonic from entropy
    return bip39.entropyToMnemonic(entropy, wordlist)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating secure mnemonic:', error)
    throw new Error('Failed to generate secure mnemonic phrase')
  }
}

/**
 * Validate a mnemonic phrase according to BIP39 specification
 * @param mnemonic The mnemonic phrase to validate
 * @returns True if the mnemonic is valid according to BIP39
 */
export const validateMnemonicPhrase = (mnemonic: string): boolean => {
  try {
    return bip39.validateMnemonic(mnemonic.trim(), wordlist)
  } catch (error) {
    return false
  }
}

/**
 * Convert a mnemonic phrase to entropy (seed) - React Native compatible
 * @param mnemonic The mnemonic phrase
 * @param password Optional passphrase for additional security
 * @returns Promise resolving to the seed as Uint8Array
 */
export const mnemonicToSeed = async (mnemonic: string, password?: string): Promise<Uint8Array> => {
  try {
    const seed = await bip39.mnemonicToSeed(mnemonic.trim(), password)
    return seed
  } catch (error) {
    throw new Error('Failed to convert mnemonic to seed')
  }
}

/**
 * Convert a mnemonic phrase to entropy (synchronous) - Not supported with @scure/bip39
 * @param mnemonic The mnemonic phrase
 * @param password Optional passphrase
 * @returns Never returns - throws error
 */
export const mnemonicToSeedSync = (mnemonic: string, password?: string): never => {
  // Avoid unused parameter warnings
  void mnemonic
  void password

  // @scure/bip39 doesn't have a sync version, so we throw an error
  throw new Error('Synchronous seed generation not supported with @scure/bip39. Use mnemonicToSeed instead.')
}

/**
 * Get the BIP39 word list for the specified language
 * @returns Array of valid BIP39 words (English)
 */
export const getWordList = (): string[] => {
  return wordlist
}

/**
 * Check if a word is in the BIP39 word list
 * @param word The word to check
 * @returns True if the word is valid
 */
export const isValidMnemonicWord = (word: string): boolean => {
  const wordList = getWordList()
  return wordList.includes(word.toLowerCase())
}

/**
 * Get suggestions for a partial word from the BIP39 word list
 * @param partial The partial word
 * @param maxResults Maximum number of suggestions to return
 * @returns Array of matching words
 */
export const getSuggestionsForPartialWord = (partial: string, maxResults: number = 10): string[] => {
  if (partial.length === 0) return []

  const lowercasePartial = partial.toLowerCase()
  const wordList = getWordList()
  return wordList.filter((word) => word.startsWith(lowercasePartial)).slice(0, maxResults)
}

/**
 * Split a mnemonic string into individual words
 * @param mnemonic The mnemonic phrase
 * @returns Array of individual words
 */
export const splitMnemonicToWords = (mnemonic: string): string[] => {
  return mnemonic
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
}

/**
 * Check if a mnemonic has the correct word count
 * @param mnemonic The mnemonic phrase to check
 * @param expectedLength Expected number of words (12 or 24)
 * @returns True if the word count is correct
 */
export const hasCorrectWordCount = (mnemonic: string, expectedLength: number = 24): boolean => {
  const words = splitMnemonicToWords(mnemonic)
  return words.length === expectedLength || words.length === 12
}

/**
 * Normalize mnemonic input by trimming and reducing whitespace
 * @param input Raw mnemonic input
 * @returns Normalized mnemonic string
 */
export const normalizeMnemonicInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Get the word count for a mnemonic phrase
 * @param mnemonic The mnemonic phrase
 * @returns Number of words in the mnemonic
 */
export const getMnemonicWordCount = (mnemonic: string): number => {
  return splitMnemonicToWords(mnemonic).length
}

/**
 * Check if a mnemonic phrase is a standard length (12 or 24 words)
 * @param mnemonic The mnemonic phrase to check
 * @returns True if the mnemonic is 12 or 24 words
 */
export const isStandardMnemonicLength = (mnemonic: string): boolean => {
  const wordCount = getMnemonicWordCount(mnemonic)
  return wordCount === 12 || wordCount === 24
}
