# Wallet Restore Flow

## Overview

This document explains the wallet restore functionality in the Backup package, including the complete restore flow, error handling, and mediator reconnection.

## Features

- ✅ **Auto-delete old wallet** - Automatically removes existing wallet before restore
- ✅ **Backup validation** - Validates backup file integrity before proceeding
- ✅ **Agent lifecycle management** - Properly shuts down and reinitializes agent
- ✅ **Mediator reconnection** - Automatically reconnects to mediator after restore
- ✅ **Progress tracking** - Real-time progress updates during restore
- ✅ **Comprehensive error handling** - User-friendly error messages

## Restore Flow

The wallet restore process follows these 7 steps:

```
1. VALIDATING        → Validate backup file integrity
2. SHUTTING_DOWN     → Shutdown current agent
3. DELETING_OLD      → Delete existing wallet directory
4. IMPORTING         → Import wallet from backup file
5. INITIALIZING      → Reinitialize agent with restored wallet
6. CONNECTING_MEDIATOR → Setup mediator connection
7. SUCCESS           → Restore completed successfully
```

## Usage

### Basic Usage

```typescript
import { BackupService, RestoreStatus } from '@bifold/backup'
import { setMediationToDefault } from '@bifold/core'

const backupService = new BackupService()

// Restore wallet with progress tracking
await backupService.restoreWalletComplete(
  agent,
  backupFilePath,
  mnemonic,
  walletConfig,
  mediatorUrl,
  setMediationToDefault,
  (status: RestoreStatus) => {
    console.log('Restore progress:', status)
  }
)
```

### With React Component

```typescript
import { RestoreWalletScreen } from '@bifold/backup'
import { setMediationToDefault } from '@bifold/core'

<RestoreWalletScreen
  mediatorUrl={store.preferences.selectedMediator}
  setMediationToDefault={setMediationToDefault}
  onRestoreSuccess={() => {
    console.log('Wallet restored successfully!')
  }}
/>
```

## API Reference

### `restoreWalletComplete()`

Complete wallet restore flow including agent reinitialize and mediator setup.

**Parameters:**
- `agent: Agent` - The Credo agent instance
- `backupFilePath: string` - Path to the backup file (.zip or .db)
- `mnemonic: string` - The mnemonic/key used to encrypt the wallet
- `walletConfig: WalletConfig` - Configuration for the imported wallet
- `mediatorUrl: string` - URL of the mediator to connect to
- `setMediationToDefault: Function` - Function to setup mediator (from core package)
- `onProgress?: (status: RestoreStatus) => void` - Optional progress callback

**Returns:** `Promise<void>`

**Throws:** Error if any critical step fails (validation, deletion, import, initialization)

**Example:**
```typescript
const walletConfig = {
  id: 'my-wallet',
  key: mnemonic,
}

await backupService.restoreWalletComplete(
  agent,
  '/path/to/backup.zip',
  'my secret mnemonic phrase',
  walletConfig,
  'https://mediator.example.com',
  setMediationToDefault,
  (status) => {
    console.log('Current step:', status)
  }
)
```

### `deleteWallet()`

Deletes an existing wallet directory.

**Parameters:**
- `walletId: string` - The ID of the wallet to delete

**Returns:** `Promise<void>`

**Throws:** Error if deletion fails due to permissions or file locks

**Example:**
```typescript
await backupService.deleteWallet('my-wallet-id')
```

### `RestoreStatus` Enum

Progress status values during restore:

```typescript
enum RestoreStatus {
  VALIDATING = 'validating',
  SHUTTING_DOWN = 'shutting_down',
  DELETING_OLD = 'deleting_old',
  IMPORTING = 'importing',
  INITIALIZING = 'initializing',
  CONNECTING_MEDIATOR = 'connecting_mediator',
  SUCCESS = 'success',
}
```

## Error Handling

### Error Categories

1. **Validation Errors** (Step 1)
   - File not found
   - File corrupted
   - No database in backup
   - **Action:** Show error, don't proceed

2. **Deletion Errors** (Step 3)
   - Permission denied
   - File locked
   - **Action:** Show error, don't proceed (critical)

3. **Import Errors** (Step 4)
   - Wrong mnemonic
   - Corrupted database
   - **Action:** Show error, old wallet already deleted (critical)

4. **Mediator Errors** (Step 6)
   - Mediator offline
   - Connection fails
   - **Action:** ⚠️ Show warning, don't fail restore (non-critical)

### Error Messages

The `RestoreWalletScreen` provides user-friendly error messages:

```typescript
const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase()

  if (message.includes('not found')) {
    return 'Backup file not found. Please select a valid backup file.'
  }
  if (message.includes('corrupted') || message.includes('invalid')) {
    return 'Backup file is corrupted or invalid. Please check your backup file.'
  }
  if (message.includes('mnemonic') || message.includes('key')) {
    return 'Incorrect mnemonic or key. Please check and try again.'
  }
  if (message.includes('permission')) {
    return 'Cannot access wallet files. Please restart the app and try again.'
  }
  
  return `Failed to restore wallet: ${error.message}`
}
```

## Mediator Reconnection

### Why Mediator Reconnection is Important

When you restore a wallet, you're essentially creating a new wallet instance with the same data. The mediator connection needs to be re-established because:

1. The agent instance is shutdown and reinitialized
2. The mediator connection is tied to the agent instance
3. Without reconnection, you won't receive new messages or credentials

### How It Works

The restore flow automatically handles mediator reconnection:

```typescript
// Step 6: Setup mediator connection
try {
  await setMediationToDefault(agent, mediatorUrl)
  console.log('Mediator connected successfully')
} catch (mediatorError) {
  // Don't fail entire restore if mediator fails
  console.warn('Mediator setup failed (non-critical):', mediatorError)
  // User can reconnect manually later
}
```

### Manual Reconnection

If mediator connection fails during restore, users can reconnect manually:

1. Go to Settings → Configure Mediator
2. Select the mediator
3. Connection will be re-established

## Testing

### Unit Tests

Run unit tests:
```bash
yarn test BackupService.test.ts
```

### Manual Testing Checklist

- [ ] Restore on fresh install (no existing wallet)
- [ ] Restore over existing wallet (auto-delete should work)
- [ ] Restore with wrong mnemonic (should show clear error)
- [ ] Restore with corrupted backup (should fail validation)
- [ ] Verify mediator connection after restore
- [ ] Verify can receive credentials/messages after restore
- [ ] Test on both Android and iOS

## Troubleshooting

### "Backup file not found"
- Ensure the backup file exists and is accessible
- Check file permissions

### "Backup file is corrupted or invalid"
- The backup file may be damaged
- Try creating a new backup and restore again

### "Incorrect mnemonic or key"
- Verify you're using the correct mnemonic phrase
- Check for typos or extra spaces

### "Cannot access wallet files"
- Restart the app and try again
- Check app permissions on your device

### "Mediator connection failed"
- This is non-critical - restore will still succeed
- Reconnect manually via Settings → Configure Mediator
- Check your internet connection

## Security Considerations

1. **Mnemonic Handling**
   - Never log the mnemonic
   - Clear from memory after use
   - Don't store in plain text

2. **File Permissions**
   - Wallet files are stored in app's private directory
   - Only accessible by the app

3. **Backup Validation**
   - Always validate backup integrity before deleting old wallet
   - Prevents data loss from corrupted backups

## Platform-Specific Notes

### Android
- Wallet path: `/data/user/0/com.ariesbifold/files/afi/wallet/{walletId}`
- File URIs need to be decoded: `decodeURIComponent(path.replace('file://', ''))`

### iOS
- Wallet path: `{DocumentDirectory}/afi/wallet/{walletId}`
- File URIs can be used directly

## Related Documentation

- [Credo Wallet API](https://credo.js.org/guides/tutorials/wallet-management)
- [Credo Mediator](https://credo.js.org/guides/tutorials/mediation)
- [React Native FS](https://github.com/itinance/react-native-fs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages carefully
3. Check app logs for detailed error information
4. Contact support if issue persists
