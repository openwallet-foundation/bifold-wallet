# Wallet Secret Consistency Fix

## Problem Analysis

### Root Cause
The "Incorrect key for wallet 'walletId'" error after app restart is caused by a **fundamental mismatch** between how the wallet is restored and how it's opened on subsequent app starts.

### Current Flow (BROKEN)

#### During Restore (RestoreWalletScreen.tsx):
```typescript
const targetConfig: WalletConfig = walletConfig || {
  id: 'walletId',           // ❌ Hardcoded constant
  key: mnemonic,            // ❌ Raw mnemonic used as key
}
```

#### After App Restart (useBifoldAgentSetup.ts):
```typescript
const walletSecret = await loadWalletSecret()  // Loads from keychain
await agent.wallet.open({
  id: walletSecret.id,      // ✅ 'walletId' (from keychain)
  key: walletSecret.key,    // ❌ DIFFERENT KEY (hashed PIN, not mnemonic)
})
```

### The Mismatch
1. **Restore**: Wallet is imported with `key: mnemonic` (raw mnemonic phrase)
2. **App Restart**: App tries to open wallet with `key: hashedPIN` (derived from user's PIN)
3. **Result**: Keys don't match → "Incorrect key for wallet" error

## Understanding Wallet Secret Generation

### During Onboarding (auth.tsx)
```typescript
// User sets a PIN
const setPIN = async (PIN: string): Promise<void> => {
  const secret = await secretForPIN(PIN, hashPIN)
  // secret = { id: 'walletId', key: hashedPIN, salt: randomSalt }
  await storeWalletSecret(secret)
}
```

### secretForPIN Function (keychain.ts)
```typescript
export const secretForPIN = async (
  PIN: string, 
  hashAlgorithm: (PIN: string, salt: string) => Promise<string>, 
  salt?: string
): Promise<WalletSecret> => {
  const mySalt = salt ?? uuid.v4().toString()
  const myKey = await hashAlgorithm(PIN, mySalt)  // Hash PIN with salt
  const secret: WalletSecret = {
    id: walletId,        // Always 'walletId' constant
    key: myKey,          // Hashed PIN
    salt: mySalt,        // Random salt
  }
  return secret
}
```

### Key Insight
- The wallet is **ALWAYS** created with `id: 'walletId'` (constant from constants.ts)
- The wallet key is **ALWAYS** a hashed PIN (never the raw mnemonic)
- The mnemonic is used for **backup/restore** but NOT as the wallet key

## The Correct Approach

### Option 1: Use PIN-based Key (RECOMMENDED)
The restored wallet must use the same PIN-based key that will be used on app restart.

**Flow:**
1. User provides mnemonic + sets a new PIN during restore
2. Generate wallet secret from PIN: `secretForPIN(PIN, hashPIN)`
3. Import wallet with the hashed PIN as key
4. Store wallet secret in keychain
5. On app restart, load wallet secret from keychain (same key)

### Option 2: Rekey After Import (ALTERNATIVE)
Import with mnemonic, then immediately rekey to PIN-based key.

**Flow:**
1. Import wallet with mnemonic as key
2. Immediately rekey wallet to use hashed PIN
3. Store new wallet secret in keychain
4. On app restart, load wallet secret from keychain

## Implementation Plan

### Changes Required

#### 1. RestoreWalletScreen.tsx
```typescript
// BEFORE (BROKEN)
const targetConfig: WalletConfig = {
  id: 'walletId',
  key: mnemonic,  // ❌ Wrong!
}

// AFTER (FIXED)
// User must set a PIN during restore
const [pin, setPin] = useState('')

const handleRestore = async () => {
  // Generate wallet secret from PIN (same as onboarding)
  const secret = await secretForPIN(pin, hashPIN)
  
  const targetConfig: WalletConfig = {
    id: secret.id,      // 'walletId'
    key: secret.key,    // Hashed PIN
  }
  
  // Import wallet with hashed PIN as key
  await backupService.restoreWalletComplete(
    agent,
    filePath,
    mnemonic,  // Used for decryption only
    targetConfig,
    mediatorUrl,
    onProgress
  )
  
  // Store wallet secret in keychain
  await storeWalletSecret(secret, useBiometrics)
}
```

#### 2. BackupService.ts
Update `restoreWalletComplete` to handle the key correctly:

```typescript
public async restoreWalletComplete(
  agent: Agent,
  backupFilePath: string,
  mnemonic: string,           // Decryption key for backup
  walletConfig: WalletConfig, // Target wallet config (with hashed PIN)
  mediatorUrl: string,
  onProgress?: (status: RestoreStatus) => void
): Promise<void> {
  // Import wallet using mnemonic for decryption
  await this.importWallet(agent, normalizedPath, mnemonic, walletConfig)
  
  // Open wallet with the hashed PIN key from walletConfig
  await agent.wallet.open({
    id: walletConfig.id,
    key: walletConfig.key,  // This is the hashed PIN
  })
}
```

#### 3. Update UI Flow
Add PIN input to RestoreWalletScreen:
- Mnemonic input (for backup decryption)
- PIN input (for new wallet key)
- Optional: Biometrics toggle

## Testing Checklist

### Unit Tests
- [ ] Test wallet secret generation from PIN
- [ ] Test restore with PIN-based key
- [ ] Test keychain storage after restore

### Integration Tests
- [ ] Restore wallet with mnemonic + PIN
- [ ] Close app completely
- [ ] Reopen app and enter PIN
- [ ] Verify wallet opens successfully
- [ ] Verify all credentials are present

### Edge Cases
- [ ] Restore with biometrics enabled
- [ ] Restore with biometrics disabled
- [ ] Change PIN after restore
- [ ] Multiple restore attempts

## Migration Considerations

### For Existing Users
If users have already restored wallets with the broken flow:
1. They will need to restore again with the fixed flow
2. Or implement a migration that rekeys their wallet

### Backward Compatibility
- New restore flow is NOT compatible with old flow
- Users who restored with old flow will need to restore again

## Security Considerations

### Why Not Use Mnemonic as Key?
1. **Security**: Mnemonic should be kept separate from wallet key
2. **Consistency**: All wallets use PIN-based keys
3. **Biometrics**: PIN-based keys work with biometric authentication
4. **Rekeying**: Users can change PIN without changing mnemonic

### Key Derivation
- PIN → Salt → Hash → Wallet Key
- Mnemonic → Backup Encryption/Decryption only
- These are separate concerns

## References

### Key Files
- `packages/core/src/services/keychain.ts` - Wallet secret management
- `packages/core/src/contexts/auth.tsx` - PIN and authentication
- `packages/core/src/hooks/useBifoldAgentSetup.ts` - Agent initialization
- `packages/core/src/constants.ts` - walletId constant
- `packages/backup/src/screens/RestoreWalletScreen.tsx` - Restore UI
- `packages/backup/src/services/BackupService.ts` - Restore logic

### Key Functions
- `secretForPIN()` - Generates wallet secret from PIN
- `storeWalletSecret()` - Stores secret in keychain
- `loadWalletSecret()` - Loads secret from keychain
- `agent.wallet.import()` - Imports wallet from backup
- `agent.wallet.open()` - Opens existing wallet

## Next Steps

1. Update RestoreWalletScreen to include PIN input
2. Update restore flow to use PIN-based key
3. Add keychain storage after restore
4. Test complete flow (restore → close app → reopen)
5. Update documentation
6. Add migration guide for existing users
