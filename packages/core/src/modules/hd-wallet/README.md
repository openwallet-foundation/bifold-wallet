# HD Wallet Integration for Rocca Wallet

This document explains how to integrate and use the HD wallet functionality in the Rocca Wallet using the `@algorandfoundation/xhd-wallet-api` and `bip39` libraries.

## Overview

The HD wallet integration provides hierarchical deterministic key generation for Algorand addresses and identity keys using the BIP32-Ed25519 specification. This allows for reproducible key generation from a single mnemonic phrase.

## Dependencies Added

- `@algorandfoundation/xhd-wallet-api`: Algorand's HD wallet API for key derivation and signing
- `bip39`: BIP39 mnemonic phrase utilities for seed generation

## Key Components

### 1. BIP39 Integration (`bip39`)

```typescript
import * as bip39 from 'bip39'

// Generate a new mnemonic
const mnemonic = bip39.generateMnemonic(256) // 24 words

// Validate a mnemonic
const isValid = bip39.validateMnemonic(mnemonic)

// Convert mnemonic to seed
const seed = bip39.mnemonicToSeedSync(mnemonic, "") // Empty passphrase
```

### 2. HD Wallet API Integration (`@algorandfoundation/xhd-wallet-api`)

```typescript
import { fromSeed, XHDWalletAPI, KeyContext, BIP32DerivationType } from '@algorandfoundation/xhd-wallet-api'

// Create root key from seed
const rootKey = fromSeed(seed) // Returns 96-byte Uint8Array

// Initialize crypto service
const cryptoService = new XHDWalletAPI()

// Generate Algorand address key (BIP44 path: m'/44'/283'/account'/change/address_index)
const addressKey = await cryptoService.keyGen(
  rootKey,
  KeyContext.Address,
  0, // account
  0, // addressIndex
  BIP32DerivationType.Peikert
)

// Generate identity key (BIP44 path: m'/44'/0'/account'/change/address_index)  
const identityKey = await cryptoService.keyGen(
  rootKey,
  KeyContext.Identity,
  0, // account
  0, // addressIndex
  BIP32DerivationType.Peikert
)
```

## Usage Examples

### Basic HD Wallet Service

```typescript
import { HDWalletService, createHDWallet } from '@bifold/core'

// Create HD wallet from mnemonic
const hdWallet = createHDWallet(mnemonic)

// Generate address keys
const addressKey0 = await hdWallet.generateAlgorandAddressKey(0, 0)
const addressKey1 = await hdWallet.generateAlgorandAddressKey(0, 1)

// Generate identity keys
const identityKey0 = await hdWallet.generateIdentityKey(0, 0)
const identityKey1 = await hdWallet.generateIdentityKey(0, 1)

// Sign transactions
const signature = await hdWallet.signAlgorandTransaction(
  0, // account
  0, // addressIndex
  prefixEncodedTx
)

// ECDH key exchange
const sharedSecret = await hdWallet.performECDH(
  KeyContext.Identity,
  0, // account
  0, // addressIndex
  otherPartyPublicKey,
  true // isClient
)
```

### Integration with Existing Wallet

```typescript
import { createRootKeyFromMnemonic, HDWalletService } from '@bifold/core'

// In your existing wallet initialization
const rootKey = createRootKeyFromMnemonic(existingMnemonic)

// Or use the full service
const hdWallet = new HDWalletService(existingMnemonic)

// Store rootKey for HD operations
// Use XHDWalletAPI directly for advanced operations
```

## Key Derivation Paths

The HD wallet follows BIP44 specification with Algorand-specific paths:

### Algorand Addresses
- Path: `m'/44'/283'/account'/change/address_index`
- Context: `KeyContext.Address`
- Derivation: `BIP32DerivationType.Peikert` (recommended)

### Identity Keys  
- Path: `m'/44'/0'/account'/change/address_index`
- Context: `KeyContext.Identity`
- Derivation: `BIP32DerivationType.Peikert` (recommended)

### Transaction Signing
- Use `BIP32DerivationType.Khovratovich` for transaction signing
- This follows the reference implementation alignment

## Testing and Development

### Test Vectors

The integration includes test vectors from the reference implementation in the test files.

### Jest Configuration

The Jest configuration has been updated to handle ES modules:

```javascript
transformIgnorePatterns: [
  'node_modules\\/(?!(.*react-native.*)|(uuid)|(@credo-ts\\/core)|(@credo-ts\\/anoncreds)|(@scure\\/.*)|(@noble\\/.*)|(@algorandfoundation\\/xhd-wallet-api)|(bip39)|(algo-msgpack-with-bigint))',
]
```

## Security Considerations

1. **Mnemonic Storage**: Always store mnemonic phrases securely using the existing keychain services
2. **Root Key Protection**: The 96-byte root key should be treated as highly sensitive
3. **Passphrase Support**: Optional passphrases are supported for additional security
4. **Hardware Backing**: Consider hardware-backed storage for production environments

## Integration Checklist

- [x] Add `@algorandfoundation/xhd-wallet-api` dependency
- [x] Add `bip39` dependency  
- [x] Update Jest transformIgnorePatterns for ES modules
- [x] Create HD wallet utility classes
- [x] Add comprehensive tests
- [x] Export from main package index
- [ ] Integrate with existing wallet initialization
- [ ] Add UI components for HD wallet features
- [ ] Implement account/address management
- [ ] Add transaction signing integration

## Files Added

- `src/modules/hd-wallet/hdWalletUtils.ts` - Main HD wallet utilities
- `src/modules/hd-wallet/__tests__/hdWalletUtils.test.ts` - Comprehensive tests

## Next Steps

1. **Wallet Integration**: Integrate HD wallet service into existing wallet initialization
2. **UI Components**: Create UI components for account/address management  
3. **Transaction Flow**: Integrate HD key signing into transaction flows
4. **Address Generation**: Implement address generation and management UI
5. **Account Management**: Add multi-account support with HD derivation

## References

- [xHD-Wallet-API Repository](https://github.com/algorandfoundation/xHD-Wallet-API-ts)
- [BIP32-Ed25519 Specification](https://acrobat.adobe.com/id/urn:aaid:sc:EU:04fe29b0-ea1a-478b-a886-9bb558a5242a)
- [BIP44 Multi-Account Hierarchy](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [BIP39 Mnemonic Phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)