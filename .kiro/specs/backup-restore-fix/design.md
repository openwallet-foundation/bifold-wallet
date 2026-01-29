# Backup Restore Fix - Design Document

## Overview

This design document details the technical implementation for fixing the wallet restore functionality, including:
1. Auto-deletion of existing wallet before restore
2. Proper agent lifecycle management (shutdown/restart)
3. Mediator connection reinitialize after restore
4. Comprehensive error handling

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ RestoreWalletScreen (UI)                                    │
│  - User input handling                                      │
│  - Progress display                                         │
│  - Error display                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ BackupService (Business Logic)                              │
│  - pickBackupFile()                                         │
│  - importWallet()                                           │
│  + deleteWallet()          [NEW]                            │
│  + restoreWalletComplete() [NEW]                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Agent & Mediator Helpers                                    │
│  - agent.wallet.import()                                    │
│  - agent.shutdown()                                         │
│  - agent.initialize()                                       │
│  - setMediationToDefault()                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ File System (RNFS)                                          │
│  - RNFS.exists()                                            │
│  - RNFS.unlink()                                            │
│  - RNFS.readDir()                                           │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Design

### 1. New Method: `deleteWallet()`

**Location:** `packages/backup/src/services/BackupService.ts`

**Purpose:** Safely delete an existing wallet directory

**Signature:**
```typescript
public async deleteWallet(walletId: string): Promise<void>
```

**Implementation:**
```typescript
public async deleteWallet(walletId: string): Promise<void> {
  // Construct wallet directory path
  // Android: /data/user/0/com.ariesbifold/files/afi/wallet/{walletId}
  // iOS: {DocumentDirectory}/afi/wallet/{walletId}
  const walletDir = `${RNFS.DocumentDirectoryPath}/afi/wallet/${walletId}`
  
  // Check if wallet directory exists
  if (await RNFS.exists(walletDir)) {
    // Delete entire directory recursively
    await RNFS.unlink(walletDir)
    console.log(`[BackupService] Wallet ${walletId} deleted successfully`)
  } else {
    console.log(`[BackupService] Wallet ${walletId} does not exist, skipping deletion`)
  }
}
```

**Error Handling:**
- If `RNFS.unlink()` fails (permission denied, file locked), throw error with clear message
- Caller should handle this error and show user-friendly message

### 2. New Method: `restoreWalletComplete()`

**Location:** `packages/backup/src/services/BackupService.ts`

**Purpose:** Complete restore flow including agent reinitialize and mediator setup

**Signature:**
```typescript
public async restoreWalletComplete(
  agent: Agent,
  backupFilePath: string,
  mnemonic: string,
  walletConfig: WalletConfig,
  mediatorUrl: string,
  onProgress?: (status: RestoreStatus) => void
): Promise<void>
```

**Types:**
```typescript
export enum RestoreStatus {
  VALIDATING = 'validating',
  SHUTTING_DOWN = 'shutting_down',
  DELETING_OLD = 'deleting_old',
  IMPORTING = 'importing',
  INITIALIZING = 'initializing',
  CONNECTING_MEDIATOR = 'connecting_mediator',
  SUCCESS = 'success',
}

export interface RestoreProgress {
  status: RestoreStatus
  message: string
  error?: Error
}
```

**Implementation:**
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
  
  try {
    // Step 1: Validate backup file
    onProgress?.(RestoreStatus.VALIDATING)
    await this.validateBackupFile(backupFilePath)
    
    // Step 2: Shutdown current agent
    onProgress?.(RestoreStatus.SHUTTING_DOWN)
    await agent.shutdown()
    
    // Step 3: Delete old wallet if exists
    onProgress?.(RestoreStatus.DELETING_OLD)
    await this.deleteWallet(walletId)
    
    // Step 4: Import wallet from backup
    onProgress?.(RestoreStatus.IMPORTING)
    await this.importWallet(agent, backupFilePath, mnemonic, walletConfig)
    
    // Step 5: Reinitialize agent with restored wallet
    onProgress?.(RestoreStatus.INITIALIZING)
    await agent.wallet.open({
      id: walletId,
      key: mnemonic,
    })
    await agent.initialize()
    
    // Step 6: Setup mediator connection
    onProgress?.(RestoreStatus.CONNECTING_MEDIATOR)
    try {
      await setMediationToDefault(agent, mediatorUrl)
    } catch (mediatorError) {
      // Don't fail entire restore if mediator fails
      console.warn('[BackupService] Mediator setup failed:', mediatorError)
      // Continue - user can reconnect manually later
    }
    
    // Step 7: Success
    onProgress?.(RestoreStatus.SUCCESS)
    
  } catch (error) {
    // Cleanup on error
    console.error('[BackupService] Restore failed:', error)
    throw error
  }
}
```

### 3. Helper Method: `validateBackupFile()`

**Purpose:** Validate backup file before proceeding with restore

**Implementation:**
```typescript
private async validateBackupFile(filePath: string): Promise<void> {
  // Check file exists
  if (!(await RNFS.exists(filePath))) {
    throw new Error('Backup file not found')
  }
  
  // Check file size (should be > 0)
  const stat = await RNFS.stat(filePath)
  if (stat.size === 0) {
    throw new Error('Backup file is empty')
  }
  
  // If zip file, check it can be unzipped
  if (filePath.toLowerCase().endsWith('.zip')) {
    try {
      const testUnzipDir = `${RNFS.CachesDirectoryPath}/test_unzip_${Date.now()}`
      await RNFS.mkdir(testUnzipDir)
      await unzip(filePath, testUnzipDir)
      
      // Check for sqlite.db file
      const files = await RNFS.readDir(testUnzipDir)
      const hasDb = files.some(f => f.name.endsWith('.db'))
      
      // Cleanup
      await RNFS.unlink(testUnzipDir)
      
      if (!hasDb) {
        throw new Error('No database file found in backup')
      }
    } catch (error) {
      throw new Error('Backup file is corrupted or invalid')
    }
  }
}
```

### 4. Update `RestoreWalletScreen`

**Location:** `packages/backup/src/screens/RestoreWalletScreen.tsx`

**Changes:**

1. **Add progress state:**
```typescript
const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(null)
```

2. **Update handleRestore:**
```typescript
const handleRestore = async () => {
  if (!agent) return
  if (!filePath || !mnemonic) {
    Alert.alert('Error', 'Please provide both backup file and mnemonic')
    return
  }

  const targetConfig: WalletConfig = walletConfig || {
    id: 'walletId',
    key: mnemonic,
  }

  setLoading(true)
  
  try {
    // Get mediator URL from store
    const mediatorUrl = store.preferences.selectedMediator
    
    // Use new complete restore method
    await backupService.restoreWalletComplete(
      agent,
      filePath,
      mnemonic,
      targetConfig,
      mediatorUrl,
      (status) => {
        setRestoreStatus(status)
      }
    )
    
    Alert.alert('Success', 'Wallet restored successfully')
    onRestoreSuccess?.()
    
  } catch (error) {
    const errorMessage = getErrorMessage(error as Error)
    Alert.alert('Error', errorMessage)
  } finally {
    setLoading(false)
    setRestoreStatus(null)
  }
}
```

3. **Add progress display:**
```typescript
{loading && restoreStatus && (
  <View style={styles.progressContainer}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={styles.progressText}>
      {getStatusMessage(restoreStatus)}
    </Text>
  </View>
)}
```

4. **Add status message helper:**
```typescript
const getStatusMessage = (status: RestoreStatus): string => {
  const messages = {
    [RestoreStatus.VALIDATING]: 'Validating backup file...',
    [RestoreStatus.SHUTTING_DOWN]: 'Preparing for restore...',
    [RestoreStatus.DELETING_OLD]: 'Removing old wallet...',
    [RestoreStatus.IMPORTING]: 'Importing wallet from backup...',
    [RestoreStatus.INITIALIZING]: 'Initializing wallet...',
    [RestoreStatus.CONNECTING_MEDIATOR]: 'Connecting to mediator...',
    [RestoreStatus.SUCCESS]: 'Wallet restored successfully!',
  }
  return messages[status] || 'Processing...'
}
```

5. **Add error message helper:**
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
  if (message.includes('already exists')) {
    return 'Wallet already exists. Please contact support.'
  }
  
  // Generic error
  return `Failed to restore wallet: ${error.message}`
}
```

## Data Flow

### Restore Wallet Sequence Diagram

```
User          RestoreScreen    BackupService    Agent         FileSystem    Mediator
 |                 |                |              |               |            |
 |-- Pick File --->|                |              |               |            |
 |                 |                |              |               |            |
 |-- Enter Key --->|                |              |               |            |
 |                 |                |              |               |            |
 |-- Click Restore>|                |              |               |            |
 |                 |                |              |               |            |
 |                 |-- restoreWalletComplete() --->|               |            |
 |                 |                |              |               |            |
 |                 |                |-- validateBackupFile() ----->|            |
 |                 |                |<-------------|               |            |
 |                 |                |              |               |            |
 |                 |                |-- shutdown() >|               |            |
 |                 |                |<-------------|               |            |
 |                 |                |              |               |            |
 |                 |                |-- deleteWallet() ----------->|            |
 |                 |                |<----------------------------|            |
 |                 |                |              |               |            |
 |                 |                |-- importWallet() ----------->|            |
 |                 |                |<----------------------------|            |
 |                 |                |              |               |            |
 |                 |                |-- wallet.open() ------------>|            |
 |                 |                |<-------------|               |            |
 |                 |                |              |               |            |
 |                 |                |-- initialize() ------------->|            |
 |                 |                |<-------------|               |            |
 |                 |                |              |               |            |
 |                 |                |-- setMediationToDefault() ----------------->|
 |                 |                |<------------------------------------------|
 |                 |                |              |               |            |
 |                 |<-- Success ----|              |               |            |
 |                 |                |              |               |            |
 |<-- Show Success-|                |              |               |            |
```

## Error Handling Strategy

### Error Categories

1. **Validation Errors** (Step 1)
   - File not found
   - File corrupted
   - No database in backup
   - **Action:** Show error, don't proceed

2. **Shutdown Errors** (Step 2)
   - Agent shutdown fails
   - **Action:** Log warning, force shutdown, continue

3. **Deletion Errors** (Step 3)
   - Permission denied
   - File locked
   - **Action:** Show error, don't proceed (critical)

4. **Import Errors** (Step 4)
   - Wrong mnemonic
   - Corrupted database
   - **Action:** Show error, old wallet already deleted (critical)

5. **Initialization Errors** (Step 5)
   - Agent init fails
   - **Action:** Show error, wallet imported but not usable

6. **Mediator Errors** (Step 6)
   - Mediator offline
   - Connection fails
   - **Action:** ⚠️ Show warning, don't fail restore

### Error Recovery

```typescript
try {
  await restoreWalletComplete(...)
} catch (error) {
  if (error.message.includes('permission')) {
    // Critical: Cannot proceed
    Alert.alert(
      'Permission Error',
      'Cannot access wallet files. Please restart the app and try again.',
      [{ text: 'OK' }]
    )
  } else if (error.message.includes('mnemonic')) {
    // User error: Can retry
    Alert.alert(
      'Incorrect Key',
      'The mnemonic or key you entered is incorrect. Please check and try again.',
      [{ text: 'Retry' }]
    )
  } else {
    // Generic error
    Alert.alert(
      'Restore Failed',
      `Failed to restore wallet: ${error.message}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => openSupport() }
      ]
    )
  }
}
```

## Testing Strategy

### Unit Tests

**File:** `packages/backup/src/__tests__/BackupService.test.ts`

```typescript
describe('BackupService', () => {
  describe('deleteWallet', () => {
    it('should delete wallet directory if exists', async () => {
      // Test implementation
    })
    
    it('should not throw if wallet does not exist', async () => {
      // Test implementation
    })
    
    it('should throw if permission denied', async () => {
      // Test implementation
    })
  })
  
  describe('validateBackupFile', () => {
    it('should pass for valid zip file', async () => {
      // Test implementation
    })
    
    it('should throw for corrupted zip', async () => {
      // Test implementation
    })
    
    it('should throw for empty file', async () => {
      // Test implementation
    })
  })
  
  describe('restoreWalletComplete', () => {
    it('should complete full restore flow', async () => {
      // Test implementation
    })
    
    it('should handle mediator failure gracefully', async () => {
      // Test implementation
    })
    
    it('should cleanup on import failure', async () => {
      // Test implementation
    })
  })
})
```

### Integration Tests

**Scenarios:**

1. **Happy Path:** First time restore, no existing wallet
2. **Replace Existing:** Restore over existing wallet
3. **Wrong Mnemonic:** Import fails, old wallet preserved
4. **Mediator Offline:** Wallet restored, mediator warning shown
5. **Concurrent Restore:** Multiple restore attempts

### Manual Testing Checklist

- [ ] Restore on fresh install (no existing wallet)
- [ ] Restore over existing wallet
- [ ] Restore with wrong mnemonic
- [ ] Restore with corrupted backup file
- [ ] Restore with mediator offline
- [ ] Restore while app is in background
- [ ] Restore on Android
- [ ] Restore on iOS
- [ ] Check mediator connection after restore
- [ ] Verify can receive credentials after restore
- [ ] Verify can receive messages after restore

## Performance Considerations

### Optimization Points

1. **Parallel Operations:**
   - Validate backup file while showing UI
   - Don't block UI during long operations

2. **Cleanup:**
   - Delete temporary files immediately after use
   - Use try-finally for guaranteed cleanup

3. **Memory:**
   - Don't load entire backup file into memory
   - Stream unzip operations

4. **User Experience:**
   - Show progress for each step
   - Estimated time remaining (optional)
   - Cancel button (optional, complex)

## Security Considerations

1. **Mnemonic Handling:**
   - Never log mnemonic
   - Clear from memory after use
   - Don't store in plain text

2. **File Permissions:**
   - Ensure wallet files are private
   - Check file permissions after restore

3. **Backup Validation:**
   - Verify backup integrity before delete
   - Prevent malicious backup files

## Deployment

### Rollout Plan

1. **Phase 1:** Deploy to internal testing
2. **Phase 2:** Beta testing with select users
3. **Phase 3:** Gradual rollout (10% → 50% → 100%)
4. **Phase 4:** Monitor error rates and user feedback

### Rollback Plan

If critical issues found:
1. Revert to previous version
2. Disable restore feature via feature flag
3. Fix issues in hotfix branch
4. Redeploy with fixes

## Monitoring & Logging

### Metrics to Track

- Restore success rate
- Restore failure reasons (categorized)
- Average restore time
- Mediator connection success rate after restore
- User retry attempts

### Logging

```typescript
// Success
logger.info('[Restore] Wallet restored successfully', {
  walletId,
  mediatorConnected: true,
  duration: Date.now() - startTime
})

// Failure
logger.error('[Restore] Wallet restore failed', {
  walletId,
  step: 'importing',
  error: error.message,
  duration: Date.now() - startTime
})
```

## Future Enhancements

1. **Backup Verification:** Verify backup before delete old wallet
2. **Incremental Restore:** Only restore changed data
3. **Cloud Backup:** Auto-backup to cloud storage
4. **Multi-Wallet:** Support multiple wallets
5. **Restore History:** Track restore operations
6. **Undo Restore:** Rollback to previous wallet (within time window)

## References

- Credo-ts Wallet API: https://credo.js.org/guides/tutorials/wallet-management
- Credo-ts Mediator: https://credo.js.org/guides/tutorials/mediation
- React Native FS: https://github.com/itinance/react-native-fs
- Current implementation: `packages/backup/src/`
