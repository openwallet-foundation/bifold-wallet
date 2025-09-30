/**
 * BIP39 Deterministic Passkey Integration for Rocca Wallet
 *
 * This utility integrates the hashmap-credo-core BIP39 wallet functionality
 * to generate deterministic P-256 passkeys for WebAuthn authentication.
 */

import {
  createDeterministicP256Key,
  enhancedCreateKey,
  type DeterministicP256Options,
  type BIP39WalletCreateKeyOptions,
} from '@credo-ts/core'
import { WalletApi } from '@credo-ts/core'
import type { BifoldAgent } from './agent'

/**
 * Options for configuring deterministic passkey generation
 */
export interface PasskeyGenerationOptions {
  /** BIP39 mnemonic phrase for deterministic generation */
  mnemonic: string
  /** WebAuthn origin/domain (e.g., "https://example.com") */
  origin: string
  /** WebAuthn user handle/identifier */
  userHandle: string
  /** Optional counter for generating multiple keys */
  counter?: number
}

/**
 * Enhanced wallet API that supports deterministic P-256 passkey generation
 */
export class BIP39PasskeyWallet {
  private originalWallet: WalletApi
  private defaultPasskeyOptions?: PasskeyGenerationOptions

  constructor(originalWallet: WalletApi, defaultOptions?: PasskeyGenerationOptions) {
    this.originalWallet = originalWallet
    this.defaultPasskeyOptions = defaultOptions
  }

  /**
   * Create a key with optional deterministic P-256 passkey generation
   */
  async createKey(options: BIP39WalletCreateKeyOptions): Promise<import('@credo-ts/core').Key> {
    return enhancedCreateKey(this.originalWallet.createKey.bind(this.originalWallet), options)
  }

  /**
   * Generate a deterministic P-256 passkey for WebAuthn
   */
  async createDeterministicPasskey(options: PasskeyGenerationOptions): Promise<import('@credo-ts/core').Key> {
    const p256Options: DeterministicP256Options = {
      mnemonic: options.mnemonic,
      origin: options.origin,
      userHandle: options.userHandle,
      counter: options.counter || 0,
    }

    return createDeterministicP256Key(p256Options)
  }

  /**
   * Create a P-256 passkey using default options if configured
   */
  async createDefaultPasskey(userHandle?: string, counter?: number): Promise<import('@credo-ts/core').Key> {
    if (!this.defaultPasskeyOptions) {
      throw new Error('No default passkey options configured. Use createDeterministicPasskey() with explicit options.')
    }

    return this.createDeterministicPasskey({
      ...this.defaultPasskeyOptions,
      userHandle: userHandle || this.defaultPasskeyOptions.userHandle,
      counter: counter || this.defaultPasskeyOptions.counter || 0,
    })
  }

  // Delegate all other methods to the original wallet
  get isInitialized() {
    return this.originalWallet.isInitialized
  }
  get isProvisioned() {
    return this.originalWallet.isProvisioned
  }
  get walletConfig() {
    return this.originalWallet.walletConfig
  }

  async initialize(options: any) {
    return this.originalWallet.initialize(options)
  }
  async create(options: any) {
    return this.originalWallet.create(options)
  }
  async createAndOpen(options: any) {
    return this.originalWallet.createAndOpen(options)
  }
  async open(options: any) {
    return this.originalWallet.open(options)
  }
  async rotateKey(options: any) {
    return this.originalWallet.rotateKey(options)
  }
  async close() {
    return this.originalWallet.close()
  }
  async delete() {
    return this.originalWallet.delete()
  }
  async export(options: any) {
    return this.originalWallet.export(options)
  }
  async import(walletConfig: any, importConfig: any) {
    return this.originalWallet.import(walletConfig, importConfig)
  }
  async generateNonce() {
    return this.originalWallet.generateNonce()
  }
}

/**
 * Enhance an existing agent with BIP39 deterministic passkey capabilities
 */
export function enhanceAgentWithPasskeys(
  agent: BifoldAgent,
  passkeyOptions?: PasskeyGenerationOptions
): BIP39PasskeyWallet {
  return new BIP39PasskeyWallet(agent.wallet, passkeyOptions)
}

/**
 * Utility to generate a deterministic passkey directly without wrapping the wallet
 */
export async function generateDeterministicPasskey(options: PasskeyGenerationOptions) {
  const p256Options: DeterministicP256Options = {
    mnemonic: options.mnemonic,
    origin: options.origin,
    userHandle: options.userHandle,
    counter: options.counter || 0,
  }

  return createDeterministicP256Key(p256Options)
}

/**
 * Helper to validate BIP39 mnemonic phrases
 */
export function validateMnemonic(mnemonic: string): boolean {
  // Basic validation - should be 12, 15, 18, 21, or 24 words
  const words = mnemonic.trim().split(/\s+/)
  return [12, 15, 18, 21, 24].includes(words.length)
}

/**
 * Generate a deterministic user handle from a base identifier
 * This can be useful for consistent user identification across sessions
 */
export function generateDeterministicUserHandle(baseId: string, domain: string): string {
  // Simple deterministic approach - you might want to use a more sophisticated method
  return `${baseId}@${domain}`
}
