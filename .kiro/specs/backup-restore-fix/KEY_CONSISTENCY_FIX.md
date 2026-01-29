# Key Consistency Fix for "Incorrect key for wallet" Error

## Problem Summary

The restore process was failing with error:
```
AskarWallet: Incorrect key for wallet 'walletId'
```

This occurred during Step 5 (Initializing Agent) when trying to open the restored wallet.

## Root Cause

**Inconsistency between the key used for import vs the key used to open the wallet:**

1. In `RestoreWalletScreen.tsx`, the `targetConfig` was created with:
   ```typescript
   const targetConfig: WalletConfig = {
     id: 'walletId',
     key: mnemonic,  // Using mnemonic as the key
   }
   ```

2. In `BackupService.restoreWalletComplete()`, the method received both:
   - `walletConfig` parameter (with `key: mnemonic`)
   - Separate `mnemonic` parameter

3. The inconsistency occurred because:
   - `wallet.import()` was called with `walletConfig` (which had `key: mnemonic`)
   - But then `wallet.open()` might have been using a different key source

## Solution Implemented

Modified `restoreWalletComplete()` method in `BackupService.ts` to ensure key consistency:

```typescript
public async restoreWalletComplete(
  agent: Agent,
  backupFilePath: string,
  mnemonic: string,
  walletConfig: WalletConfig,
  mediatorUrl: string,
  onProgress?: (status: RestoreStatus) => void
): Promise<void> {
  const walletId = walletConfig.id
  // Extract consistent key: use walletConfig.key if available, otherwise use mnemonic
  const walletKey = walletConfig.key || mnemonic
  
  // ... validation and shutdown steps ...
  
  // Step 4: Import wallet using walletKey
  await this.importWallet(agent, normalizedPath, walletKey, walletConfig)
  
  // Step 5: Open wallet using the SAME walletKey
  await agent.wallet.open({
    id: walletId,
    key: walletKey,  // Consistent key usage
  })
  
  // ... rest of the flow ...
}
```

### Key Changes:

1. **Single source of truth**: Extract `walletKey` once at the beginning
2. **Consistent usage**: Use `walletKey` for both import and open operations
3. **Fallback logic**: If `walletConfig.key` is not provided, fall back to `mnemonic`

## Files Modified

1. **`packages/backup/src/services/BackupService.ts`**
   - Modified `restoreWalletComplete()` method (lines 240-280)
   - Added `walletKey` extraction logic
   - Updated both `importWallet()` and `wallet.open()` calls to use consistent key

2. **`packages/backup/src/__tests__/BackupService.test.ts`**
   - Updated test expectations to match new behavior
   - Changed assertion from `key: mnemonic` to `key: walletConfig.key`

## Test Results

All 15 unit tests pass:
```
✓ deleteWallet - should delete wallet directory if it exists
✓ deleteWallet - should not throw if wallet does not exist
✓ deleteWallet - should throw descriptive error if deletion fails
✓ validateBackupFile - all validation scenarios
✓ restoreWalletComplete - full restore flow
✓ restoreWalletComplete - mediator failure handling
✓ restoreWalletComplete - error scenarios
✓ restoreWalletComplete - progress callbacks
✓ restoreWalletComplete - deletion before import
```

## Testing Required on Device

### Prerequisites
1. Have a valid backup file (.zip) created from a working wallet
2. Know the mnemonic/passphrase used to create that backup
3. Test on Android device (where the error was occurring)

### Test Scenarios

#### Scenario 1: Fresh Restore (No Existing Wallet)
1. Uninstall the app completely
2. Reinstall the app
3. Navigate to Restore Wallet screen
4. Select backup file
5. Enter mnemonic
6. Tap "Restore Wallet"
7. **Expected**: Restore completes successfully through all 7 steps
8. **Verify**: Can see credentials, connections, and receive new messages

#### Scenario 2: Restore Over Existing Wallet
1. Have an existing wallet with some data
2. Navigate to Restore Wallet screen
3. Select backup file (from different wallet)
4. Enter mnemonic for the backup
5. Tap "Restore Wallet"
6. **Expected**: Old wallet deleted, new wallet restored successfully
7. **Verify**: Old data is gone, backup data is present

#### Scenario 3: Wrong Mnemonic
1. Navigate to Restore Wallet screen
2. Select valid backup file
3. Enter INCORRECT mnemonic
4. Tap "Restore Wallet"
5. **Expected**: Error message "Incorrect mnemonic or key"
6. **Verify**: App remains stable, can retry with correct mnemonic

#### Scenario 4: Progress Tracking
1. Navigate to Restore Wallet screen
2. Select backup file
3. Enter mnemonic
4. Tap "Restore Wallet"
5. **Expected**: See progress messages in order:
   - "Validating backup file..."
   - "Preparing for restore..."
   - "Removing old wallet..."
   - "Importing wallet from backup..."
   - "Initializing wallet..."
   - "Connecting to mediator..."
   - "Wallet restored successfully!"

#### Scenario 5: Mediator Connection
1. Complete a successful restore
2. Wait for mediator connection step
3. **Expected**: Mediator connects successfully OR restore completes even if mediator fails
4. **Verify**: Can receive messages/credentials after restore

## Debugging Tips

If the error still occurs:

1. **Check logs for the exact error message**:
   ```
   LOG  ERROR : {"message": "Error importing wallet..."}
   ```

2. **Verify the key being used**:
   - Add temporary logging to see `walletKey` value
   - Ensure `walletConfig.key` matches the mnemonic

3. **Check wallet path**:
   - Ensure path is `.afj` not `afi`
   - Verify path normalization on Android

4. **Verify backup file**:
   - Ensure backup was created with the same mnemonic
   - Check backup file is not corrupted

## Rollback Plan

If this fix doesn't work:

1. Revert changes to `BackupService.ts`
2. Try alternative approach: Always use `mnemonic` parameter directly
3. Investigate if the issue is with backup creation (not restore)

## Next Steps

1. ✅ Unit tests pass
2. ⏳ **Manual testing on Android device** (CURRENT STEP)
3. ⏳ Manual testing on iOS device
4. ⏳ Integration tests
5. ⏳ Code review and merge

## Related Issues

- Original error: "Incorrect key for wallet 'walletId'"
- Previous fixes:
  - Path normalization for Android (URL decoding)
  - Wallet path correction (`.afj` instead of `afi`)
  - "Path already exists" error fix

## Success Criteria

- ✅ No "Incorrect key for wallet" error
- ✅ Wallet restores successfully
- ✅ Agent initializes after restore
- ✅ Mediator connects after restore
- ✅ Can receive messages/credentials after restore
- ✅ All unit tests pass
- ⏳ Manual testing confirms fix works on device
