import * as bip39 from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'
import { fromSeed, XHDWalletAPI, KeyContext, BIP32DerivationType } from 'hmd2v-xhd-wallet-api'

/**
 * HD Wallet utilities for Algorand key derivation using xHD-Wallet-API
 */

/**
 * Async version: Creates a root key from a BIP39 mnemonic phrase
 * @param mnemonic BIP39 mnemonic phrase
 * @param passphrase Optional passphrase (empty string by default)
 * @returns Promise<Uint8Array> (96 bytes)
 */
export const createRootKeyFromMnemonicAsync = async (
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> => {
  const seed = await bip39.mnemonicToSeed(mnemonic, passphrase)
  return fromSeed(Buffer.from(seed))
}

/**
 * HD Wallet service for key generation and derivation
 */
export class HDWalletService {
  private cryptoService: XHDWalletAPI
  private rootKey: Uint8Array

  constructor(rootKey: Uint8Array) {
    this.cryptoService = new XHDWalletAPI()
    this.rootKey = rootKey
  }

  static async fromMnemonic(mnemonic: string, passphrase: string = ''): Promise<HDWalletService> {
    const rootKey = await createRootKeyFromMnemonicAsync(mnemonic, passphrase)
    return new HDWalletService(rootKey)
  }

  static fromRootKey(precomputedRootKey: Uint8Array): HDWalletService {
    return new HDWalletService(precomputedRootKey)
  }

  async generateAlgorandAddressKey(
    account: number,
    addressIndex: number,
    derivationType: BIP32DerivationType = BIP32DerivationType.Peikert
  ): Promise<Uint8Array> {
    return await this.cryptoService.keyGen(this.rootKey, KeyContext.Address, account, addressIndex, derivationType)
  }

  async generateIdentityKey(
    account: number,
    addressIndex: number,
    derivationType: BIP32DerivationType = BIP32DerivationType.Peikert
  ): Promise<Uint8Array> {
    return await this.cryptoService.keyGen(this.rootKey, KeyContext.Identity, account, addressIndex, derivationType)
  }

  getRootKey(): Uint8Array {
    return this.rootKey
  }

  getCryptoService(): XHDWalletAPI {
    return this.cryptoService
  }

  async signAlgorandTransaction(
    account: number,
    addressIndex: number,
    prefixEncodedTx: Uint8Array,
    derivationType: BIP32DerivationType = BIP32DerivationType.Khovratovich
  ): Promise<Uint8Array> {
    return await this.cryptoService.signAlgoTransaction(
      this.rootKey,
      KeyContext.Address,
      account,
      addressIndex,
      prefixEncodedTx,
      derivationType
    )
  }

  async performECDH(
    keyContext: KeyContext,
    account: number,
    addressIndex: number,
    otherPartyPublicKey: Uint8Array,
    isClient: boolean
  ): Promise<Uint8Array> {
    return await this.cryptoService.ECDH(this.rootKey, keyContext, account, addressIndex, otherPartyPublicKey, isClient)
  }
}

/**
 * Validates a BIP39 mnemonic phrase
 * @param mnemonic The mnemonic phrase to validate
 * @returns True if valid, false otherwise
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic, wordlist)
}

/**
 * Generates a new BIP39 mnemonic phrase
 * @param strength Entropy strength in bits (128, 160, 192, 224, 256)
 * @returns Generated mnemonic phrase
 */
export const generateMnemonic = (strength: number = 256): string => {
  return bip39.generateMnemonic(wordlist, strength)
}

/**
 * Creates an HD wallet service instance from a mnemonic
 * @param mnemonic BIP39 mnemonic phrase
 * @param passphrase Optional passphrase
 * @returns HDWalletService instance
 */
/**
 * Async: Creates an HD wallet service instance from a mnemonic
 * @param mnemonic BIP39 mnemonic phrase
 * @param passphrase Optional passphrase
 * @returns Promise<HDWalletService>
 */
export const createHDWalletAsync = async (mnemonic: string, passphrase?: string): Promise<HDWalletService> => {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid BIP39 mnemonic phrase')
  }
  return await HDWalletService.fromMnemonic(mnemonic, passphrase)
}
