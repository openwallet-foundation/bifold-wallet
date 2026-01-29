# Testing Guide: Wallet Restore Fix

## Quick Start

Dua bug telah diperbaiki:
1. ✅ **"Incorrect key for wallet"** - Fixed dengan key consistency
2. ✅ **"Cannot connect to pool already connected"** - Fixed dengan wallet.close instead of agent.shutdown

Sekarang Anda perlu test restore flow di Android device.

## What Was Fixed

### Bug 1: Incorrect Key Error
**Problem**: Restore gagal dengan "Incorrect key for wallet 'walletId'" error saat agent initialization.

**Solution**: Memastikan key yang sama digunakan untuk wallet import dan wallet open.

### Bug 2: Pool Connection Error  
**Problem**: Setelah fix bug 1, muncul error "Cannot connect to pool already connected".

**Solution**: Menggunakan `wallet.close()` instead of `agent.shutdown()` untuk menjaga agent state tetap valid.

**Code Change**: 
- Sebelumnya: `agent.shutdown()` → `wallet.open()` → Error!
- Sekarang: `wallet.close()` → `wallet.open()` → Success!

## How to Test

### Step 1: Prepare Test Environment

1. **Build and install the app** on your Android device:
   ```bash
   cd samples/app
   yarn android
   ```

2. **Have a backup file ready**:
   - Use an existing backup file (.zip)
   - Know the mnemonic used to create it

### Step 2: Test the Restore Flow

1. **Open the app** on your device
2. **Navigate to Restore Wallet screen**
3. **Tap "Select File"** and choose your backup file
4. **Enter the mnemonic** in the text field
5. **Tap "Restore Wallet"**

### Step 3: Observe the Progress

You should see these messages in order:
1. ✅ "Validating backup file..."
2. ✅ "Preparing for restore..."
3. ✅ "Removing old wallet..."
4. ✅ "Importing wallet from backup..."
5. ✅ "Initializing wallet..." ← **This is where it was failing before**
6. ✅ "Connecting to mediator..."
7. ✅ "Wallet restored successfully!"

### Step 4: Verify Success

After restore completes:
- ✅ No error messages
- ✅ Can see your credentials
- ✅ Can see your connections
- ✅ Can receive new messages/credentials

## Expected Results

### ✅ Success Indicators
- All 7 progress steps complete
- Success alert appears
- Wallet data is restored
- Mediator connects (or restore completes even if mediator fails)
- App remains stable

### ❌ Failure Indicators
- Error at "Initializing wallet..." step
- "Incorrect key for wallet" error ← **Should be fixed now**
- "Cannot connect to pool already connected" error ← **Should be fixed now**
- App crashes
- Wallet data not restored

## If It Still Fails

### Check the Logs

Look for error messages in the device logs:
```bash
adb logcat | grep -i "error\|wallet\|restore"
```

### Common Issues

1. **"Backup file not found"**
   - File path issue
   - Try selecting the file again

2. **"Incorrect mnemonic or key"**
   - Wrong mnemonic entered
   - Verify the mnemonic matches the backup

3. **"Path already exists"**
   - Old wallet not deleted
   - This should be fixed, but if it occurs, report it

4. **"Incorrect key for wallet"**
   - This is bug #1 we fixed
   - If it still occurs, check the key being used

5. **"Cannot connect to pool already connected"**
   - This is bug #2 we fixed  
   - If it still occurs, check agent/wallet state

### Report Results

Please report back with:
1. ✅ Success or ❌ Failure
2. Which step it failed at (if failed)
3. Error message (if any)
4. Device logs (if available)

## Test Scenarios (Optional)

If you have time, test these scenarios:

### Scenario A: Fresh Install
1. Uninstall app completely
2. Reinstall app
3. Restore wallet
4. **Expected**: Works perfectly

### Scenario B: Wrong Mnemonic
1. Select backup file
2. Enter WRONG mnemonic
3. Tap restore
4. **Expected**: Clear error message, can retry

### Scenario C: Corrupted Backup
1. Select a corrupted/invalid file
2. Tap restore
3. **Expected**: Validation error, no crash

## Quick Reference

### Files Changed
- `packages/backup/src/services/BackupService.ts` (key consistency + wallet.close fix)
- `packages/backup/src/__tests__/BackupService.test.ts` (test updates)

### Test Status
- ✅ 15/15 unit tests passing
- ✅ TypeScript compilation successful
- ✅ ESLint checks passing
- ✅ Key consistency fix implemented
- ✅ Pool connection fix implemented
- ⏳ **Manual testing needed** ← YOU ARE HERE

### Next Steps After Testing
1. If successful → Proceed to iOS testing
2. If failed → Report error details for further investigation

## Questions?

If you encounter any issues or have questions:
1. Check the error logs
2. Review `KEY_CONSISTENCY_FIX.md` for technical details
3. Report the issue with logs and screenshots
