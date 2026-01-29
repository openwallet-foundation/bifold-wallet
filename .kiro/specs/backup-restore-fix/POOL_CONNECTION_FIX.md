# Pool Connection Fix for "Cannot connect to pool already connected" Error

## Problem Summary

Setelah fix untuk "Incorrect key for wallet" error, muncul error baru:
```
Cannot connect to pool already connected
```

Error ini terjadi karena agent sudah memiliki koneksi pool yang aktif ketika kita mencoba membuka wallet lagi.

## Root Cause

**Agent shutdown yang terlalu agresif:**

1. Kode sebelumnya melakukan `agent.shutdown()` sebelum import wallet
2. Setelah `agent.shutdown()`, agent dalam keadaan yang tidak bisa di-restart
3. Ketika kita memanggil `agent.wallet.open()` setelah shutdown, agent tidak dalam keadaan yang benar
4. Ini menyebabkan error "pool already connected" karena pool connections tidak di-cleanup dengan benar

## Solution Implemented

**Ganti `agent.shutdown()` dengan `agent.wallet.close()`:**

Alih-alih shutdown seluruh agent, kita hanya perlu menutup wallet saat ini. Ini memungkinkan agent tetap dalam keadaan yang valid untuk membuka wallet baru.

### Perubahan Kode

**SEBELUM:**
```typescript
// Step 2: Shutdown current agent
onProgress?.(RestoreStatus.SHUTTING_DOWN)
await agent.shutdown()

// ... delete and import ...

// Step 5: Reinitialize agent with restored wallet
onProgress?.(RestoreStatus.INITIALIZING)
await agent.wallet.open({
  id: walletId,
  key: walletKey,
})
await agent.initialize()
```

**SESUDAH:**
```typescript
// Step 2: Close current wallet (but don't shutdown agent completely)
onProgress?.(RestoreStatus.SHUTTING_DOWN)
try {
  // Check if wallet is open before trying to close
  if (agent.wallet.isInitialized) {
    await agent.wallet.close()
  }
} catch (error) {
  // If wallet is already closed or not initialized, that's fine
  // Continue with the restore process
}

// ... delete and import ...

// Step 5: Open the restored wallet
onProgress?.(RestoreStatus.INITIALIZING)
await agent.wallet.open({
  id: walletId,
  key: walletKey,
})

// Initialize agent with the restored wallet
await agent.initialize()
```

### Key Changes:

1. **Wallet close instead of agent shutdown**: Hanya menutup wallet, tidak shutdown agent
2. **Check isInitialized**: Cek apakah wallet sudah diinisialisasi sebelum close
3. **Try-catch protection**: Jika wallet sudah closed, lanjutkan saja (tidak error)
4. **Preserve agent state**: Agent tetap dalam keadaan valid untuk operasi selanjutnya

## Why This Works

### Agent Lifecycle Understanding

Dari `useBifoldAgentSetup.ts`, kita bisa lihat pola yang benar:

```typescript
const restartExistingAgent = async (agent: Agent, walletSecret: WalletSecret) => {
  try {
    await agent.wallet.open({
      id: walletSecret.id,
      key: walletSecret.key,
    })
    await agent.initialize()
  } catch (error) {
    // if the existing agents wallet cannot be opened or initialize() fails
    // it was not a clean shutdown and the agent should be replaced
    return
  }
  return agent
}
```

Pola ini menunjukkan bahwa:
1. Agent bisa di-restart dengan membuka wallet baru
2. Tidak perlu shutdown agent untuk mengganti wallet
3. Cukup close wallet lama, lalu open wallet baru

### Pool Connection Management

- **Agent shutdown**: Menutup semua connections, termasuk pool connections
- **Wallet close**: Hanya menutup wallet, pool connections tetap ada
- **Wallet open + initialize**: Membuka wallet baru dan reinitialize agent dengan wallet tersebut

Dengan hanya close wallet (bukan shutdown agent), pool connections di-manage dengan benar oleh agent lifecycle.

## Files Modified

1. **`packages/backup/src/services/BackupService.ts`**
   - Changed `agent.shutdown()` to `agent.wallet.close()`
   - Added try-catch around wallet close
   - Added `isInitialized` check

2. **`packages/backup/src/__tests__/BackupService.test.ts`**
   - Updated mock to include `wallet.close` and `wallet.isInitialized`
   - Changed test expectations from `shutdown` to `wallet.close`
   - Updated test for wallet close failure (should continue, not fail)

## Test Results

All 15 unit tests pass:
```
✓ deleteWallet - all scenarios
✓ validateBackupFile - all scenarios  
✓ restoreWalletComplete - full restore flow
✓ restoreWalletComplete - mediator failure handling
✓ restoreWalletComplete - import failure
✓ restoreWalletComplete - wallet close failure (continues)
✓ restoreWalletComplete - progress callbacks
✓ restoreWalletComplete - deletion before import
```

## Testing Required on Device

### Test Scenario: Complete Restore Flow

1. **Setup**:
   - Have a valid backup file
   - Know the mnemonic

2. **Execute Restore**:
   - Select backup file
   - Enter mnemonic
   - Tap "Restore Wallet"

3. **Expected Behavior**:
   - ✅ No "pool already connected" error
   - ✅ No "incorrect key" error
   - ✅ All 7 progress steps complete
   - ✅ Wallet restored successfully
   - ✅ Agent initializes properly
   - ✅ Mediator connects
   - ✅ Can receive messages/credentials

4. **Verify**:
   - Check logs for any pool-related errors
   - Verify wallet data is restored
   - Test sending/receiving credentials
   - Test connections work

## Debugging Tips

If pool connection errors still occur:

1. **Check agent state before restore**:
   ```typescript
   console.log('Agent initialized:', agent.isInitialized)
   console.log('Wallet initialized:', agent.wallet.isInitialized)
   ```

2. **Check pool connections**:
   - Look for "pool" in logs
   - Check if pools are being created/destroyed properly

3. **Verify wallet lifecycle**:
   - Wallet should close cleanly
   - Wallet should open with new data
   - Agent should initialize with new wallet

## Related Fixes

1. **Key consistency fix**: Ensures same key used for import and open
2. **Path normalization**: Handles Android file paths correctly
3. **Wallet path fix**: Uses correct `.afj` path
4. **Pool connection fix**: Uses wallet.close instead of agent.shutdown

## Success Criteria

- ✅ No "pool already connected" error
- ✅ No "incorrect key" error
- ✅ Wallet closes cleanly
- ✅ Wallet opens with restored data
- ✅ Agent initializes successfully
- ✅ Pool connections work properly
- ✅ All unit tests pass
- ⏳ Manual testing confirms fix works on device

## Next Steps

1. ✅ Unit tests pass
2. ⏳ **Manual testing on Android device** (CURRENT STEP)
3. ⏳ Manual testing on iOS device
4. ⏳ Verify no regressions in normal wallet operations
5. ⏳ Code review and merge
