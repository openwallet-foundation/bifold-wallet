# Agent Re-initialization Fix for "Agent already initialized" Error

## Problem Summary

Setelah fix untuk pool connection error, muncul error baru:
```
Failed to restore wallet: Agent already initialized. Currently it is not supported to re-initialize an already initialized agent.
```

Error ini terjadi saat kita mencoba memanggil `agent.initialize()` pada agent yang sudah initialized.

## Root Cause

**Agent.initialize() dipanggil tanpa check:**

1. Setelah `wallet.close()` dan `wallet.open()`, agent masih dalam keadaan initialized
2. Kode memanggil `agent.initialize()` tanpa mengecek apakah agent sudah initialized
3. Credo-ts tidak support re-initialization agent yang sudah initialized
4. Ini menyebabkan error dan restore gagal

## Solution Implemented

**Add check sebelum agent.initialize():**

Sebelum memanggil `agent.initialize()`, kita check dulu apakah agent sudah initialized. Jika sudah, skip initialize step.

### Perubahan Kode

**SEBELUM:**
```typescript
// Step 5: Open the restored wallet
onProgress?.(RestoreStatus.INITIALIZING)
await agent.wallet.open({
  id: walletId,
  key: walletKey,
})

// Initialize agent with the restored wallet
await agent.initialize()
```

**SESUDAH:**
```typescript
// Step 5: Open the restored wallet
onProgress?.(RestoreStatus.INITIALIZING)
await agent.wallet.open({
  id: walletId,
  key: walletKey,
})

// Initialize agent with the restored wallet (only if not already initialized)
if (!agent.isInitialized) {
  await agent.initialize()
}
```

### Key Changes:

1. **Check isInitialized**: Cek `agent.isInitialized` sebelum initialize
2. **Conditional initialize**: Hanya initialize jika agent belum initialized
3. **Safe for both scenarios**: Works untuk agent baru maupun agent yang sudah ada

## Why This Works

### Agent State Understanding

Agent bisa dalam 2 keadaan:
1. **Not initialized**: Perlu `initialize()` setelah `wallet.open()`
2. **Already initialized**: Hanya perlu `wallet.open()`, tidak perlu `initialize()` lagi

Dengan check `isInitialized`, kita handle kedua scenario dengan benar.

### Restore Flow

```
1. wallet.close() → Agent masih initialized, wallet closed
2. deleteWallet() → Hapus wallet files
3. importWallet() → Import wallet baru
4. wallet.open() → Buka wallet yang baru di-import
5. Check isInitialized:
   - If false → agent.initialize() (agent baru)
   - If true → skip initialize (agent existing)
6. Success!
```

## Files Modified

1. **`packages/backup/src/services/BackupService.ts`**
   - Added `if (!agent.isInitialized)` check before `agent.initialize()`

2. **`packages/backup/src/__tests__/BackupService.test.ts`**
   - Added `isInitialized: false` to mock agent
   - Added test for agent already initialized scenario
   - Added test for agent not initialized scenario

## Test Results

All 17 unit tests pass (added 2 new tests):
```
✓ deleteWallet - all scenarios (4 tests)
✓ validateBackupFile - all scenarios (5 tests)
✓ restoreWalletComplete - all scenarios (8 tests)
  ✓ full restore flow
  ✓ mediator failure handling
  ✓ import failure
  ✓ wallet close failure (continues)
  ✓ progress callbacks
  ✓ deletion before import
  ✓ agent already initialized (NEW)
  ✓ agent not initialized (NEW)
```

## Testing Required on Device

### Test Scenario: Restore with Existing Agent

1. **Setup**:
   - App already running with initialized agent
   - Have a valid backup file
   - Know the mnemonic

2. **Execute Restore**:
   - Navigate to Restore Wallet screen
   - Select backup file
   - Enter mnemonic
   - Tap "Restore Wallet"

3. **Expected Behavior**:
   - ✅ No "agent already initialized" error
   - ✅ No "pool already connected" error
   - ✅ No "incorrect key" error
   - ✅ All 7 progress steps complete
   - ✅ Wallet restored successfully
   - ✅ Agent works properly after restore
   - ✅ Can receive messages/credentials

4. **Verify**:
   - Check logs for any initialization errors
   - Verify wallet data is restored
   - Test agent functionality (send/receive)
   - Verify connections work

## Debugging Tips

If agent initialization errors still occur:

1. **Check agent state**:
   ```typescript
   console.log('Agent initialized:', agent.isInitialized)
   console.log('Wallet initialized:', agent.wallet.isInitialized)
   ```

2. **Check initialization flow**:
   - Wallet should close cleanly
   - Wallet should open with new data
   - Agent should skip initialize if already initialized

3. **Verify agent lifecycle**:
   - Agent state should be preserved
   - Only wallet changes, not agent
   - Agent should work after wallet change

## Related Fixes

1. **Key consistency fix**: Ensures same key used for import and open
2. **Path normalization**: Handles Android file paths correctly
3. **Wallet path fix**: Uses correct `.afj` path
4. **Pool connection fix**: Uses wallet.close instead of agent.shutdown
5. **Agent re-initialization fix**: Checks isInitialized before initialize

## Success Criteria

- ✅ No "agent already initialized" error
- ✅ No "pool already connected" error
- ✅ No "incorrect key" error
- ✅ Wallet closes cleanly
- ✅ Wallet opens with restored data
- ✅ Agent initialize only when needed
- ✅ Agent works properly after restore
- ✅ All unit tests pass (17/17)
- ⏳ Manual testing confirms fix works on device

## Implementation Summary

### Complete Restore Flow (Final Version)

```typescript
1. Validate backup file ✅
2. Close wallet (not shutdown agent) ✅
3. Delete old wallet ✅
4. Import wallet from backup ✅
5. Open restored wallet ✅
6. Initialize agent (only if not initialized) ✅ NEW
7. Connect to mediator ✅
8. Success! ✅
```

### All Fixes Applied

1. ✅ **File path normalization** (Android URL decoding)
2. ✅ **Wallet path correction** (`.afj` not `afi`)
3. ✅ **Key consistency** (same key for import and open)
4. ✅ **Pool connection** (wallet.close not agent.shutdown)
5. ✅ **Agent re-initialization** (check isInitialized before initialize)

## Next Steps

1. ✅ Unit tests pass (17/17)
2. ⏳ **Manual testing on Android device** (CURRENT STEP)
3. ⏳ Manual testing on iOS device
4. ⏳ Verify no regressions
5. ⏳ Code review and merge
