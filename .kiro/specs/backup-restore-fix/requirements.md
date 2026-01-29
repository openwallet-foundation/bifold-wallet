# Backup Package - Restore Wallet Error Fix

## Problem Statement

Ketika melakukan restore wallet dari backup file, muncul error:
```
Error importing wallet 'walletId': Unable to import wallet. 
Path '/data/user/0/com.ariesbifold/files/afi/wallet/walletId/sqlite.db' already exists
```

Error ini terjadi karena:
1. **Wallet ID hardcoded**: Di `RestoreWalletScreen.tsx`, wallet config menggunakan ID statis `'walletId'`
2. **Tidak ada pengecekan wallet existing**: Sebelum import, tidak ada validasi apakah wallet dengan ID tersebut sudah ada
3. **Tidak ada cleanup wallet lama**: Tidak ada opsi untuk menghapus wallet lama sebelum restore
4. **Mediator tidak di-reinitialize**: Setelah restore, mediator connection tidak di-setup ulang, sehingga DIDComm messaging tidak berfungsi

## User Stories

### 1. Auto-Delete Old Wallet Before Restore
**As a** user  
**I want to** restore my wallet backup and automatically replace the old wallet  
**So that** I can recover my credentials without manual cleanup

**Acceptance Criteria:**
- [ ] 1.1 System detects if wallet with target ID already exists
- [ ] 1.2 If wallet exists, system automatically deletes it before restore
- [ ] 1.3 Deletion is safe - only proceeds if wallet is not currently active
- [ ] 1.4 User sees clear message: "Replacing existing wallet..."

### 2. Safe Wallet Deletion
**As a** developer  
**I want to** have a method to safely delete existing wallet  
**So that** restore can proceed without conflicts

**Acceptance Criteria:**
- [ ] 2.1 BackupService has `deleteWallet()` method
- [ ] 2.2 Method checks if wallet is currently active/initialized
- [ ] 2.3 Method removes wallet database file from filesystem
- [ ] 2.4 Method handles errors gracefully (e.g., wallet not found, permission denied)
- [ ] 2.5 Method logs deletion for debugging

### 3. Restore with Cleanup Flow
**As a** user  
**I want to** see progress during restore  
**So that** I know the operation is working

**Acceptance Criteria:**
- [ ] 3.1 Show loading indicator during restore
- [ ] 3.2 Show status messages:
  - "Checking existing wallet..."
  - "Removing old wallet..."
  - "Importing backup..."
  - "Wallet restored successfully!"
- [ ] 3.3 Handle errors at each step with clear messages

### 4. Reinitialize Mediator After Restore
**As a** user  
**I want to** have my mediator connection automatically setup after restore  
**So that** I can receive messages and credentials immediately

**Acceptance Criteria:**
- [ ] 4.1 After successful wallet import, agent is reinitialized
- [ ] 4.2 Mediator connection is provisioned using stored mediator URL
- [ ] 4.3 Default mediator is set for the restored wallet
- [ ] 4.4 User sees status: "Reconnecting to mediator..."
- [ ] 4.5 If mediator setup fails, show clear error but don't fail entire restore

### 5. Better Error Handling
**As a** user  
**I want to** see clear error messages  
**So that** I understand what went wrong and how to fix it

**Acceptance Criteria:**
- [ ] 5.1 Error messages are user-friendly (not technical)
- [ ] 5.2 Specific errors for common scenarios:
  - "Cannot restore: Wallet is currently in use"
  - "Backup file is corrupted or invalid"
  - "Incorrect mnemonic/key"
  - "Failed to connect to mediator"
- [ ] 5.3 Log technical details for debugging

## Technical Analysis

### Root Cause
```typescript
// Current code in RestoreWalletScreen.tsx
const targetConfig: WalletConfig = walletConfig || {
  id: 'walletId',  // ❌ PROBLEM: Static ID
  key: mnemonic,
}
```

### Credo-ts Wallet Import Behavior
- `agent.wallet.import()` creates a new wallet on disk
- If wallet with same ID exists, it throws error
- Credo does NOT automatically overwrite existing wallets

### Proposed Solution: Auto-Delete, Replace, and Reinitialize

**Complete Restore Flow:**
```typescript
async function restoreWallet(agent, filePath, mnemonic, walletConfig) {
  const targetId = walletConfig?.id || 'walletId'
  
  // 1. Shutdown current agent
  await agent.shutdown()
  
  // 2. Check if wallet exists and delete it
  const walletPath = getWalletPath(targetId)
  if (await RNFS.exists(walletPath)) {
    console.log('Existing wallet found, removing...')
    await deleteWallet(targetId)
  }
  
  // 3. Import wallet from backup
  await agent.wallet.import(walletConfig, {
    path: importPath,
    key: mnemonic,
  })
  
  // 4. Reinitialize agent with restored wallet
  await agent.wallet.open({
    id: targetId,
    key: mnemonic,
  })
  await agent.initialize()
  
  // 5. Setup mediator connection
  const mediatorUrl = store.preferences.selectedMediator
  await setMediationToDefault(agent, mediatorUrl)
  
  // 6. Done!
  console.log('Wallet restored and mediator connected')
}

async function deleteWallet(walletId: string) {
  const walletDir = `${RNFS.DocumentDirectoryPath}/afi/wallet/${walletId}`
  
  if (await RNFS.exists(walletDir)) {
    await RNFS.unlink(walletDir)
    console.log(`Wallet ${walletId} deleted successfully`)
  }
}
```

**Key Points:**
1. **Shutdown agent first** - Prevent file locks
2. **Delete old wallet** - Clear existing data
3. **Import backup** - Restore wallet data
4. **Reinitialize agent** - Open restored wallet
5. **Setup mediator** - Reconnect to DIDComm mediator

**Pros:**
- ✅ Complete restore - wallet + mediator
- ✅ User dapat langsung terima messages
- ✅ Tidak perlu manual setup mediator
- ✅ Clean state - tidak ada leftover data

**Cons:**
- ⚠️ Lebih complex - banyak steps
- ⚠️ Jika mediator setup gagal, perlu fallback
- ⚠️ Perlu handle agent lifecycle dengan benar

## Dependencies
- `@credo-ts/core` - Agent and Wallet APIs
- `@credo-ts/react-hooks` - useAgent hook
- `react-native-fs` - File system operations
- `mediatorhelpers.ts` - setMediationToDefault function
- `useBifoldAgentSetup.ts` - Agent initialization logic

## Risks & Mitigations

### Risk 1: Data Loss if Restore Fails
**Risk:** Wallet lama sudah dihapus, tapi restore gagal (file corrupt, wrong key, etc)  
**Mitigation:** 
- Validate backup file BEFORE deleting old wallet
- Check mnemonic format before proceeding
- Consider: Create temporary backup of old wallet

### Risk 2: Cannot Delete Active Wallet
**Risk:** User mencoba restore saat wallet sedang digunakan  
**Mitigation:**
- Check wallet initialization status
- Show error: "Please close wallet before restore"
- Or: Auto-shutdown wallet before delete (if safe)

### Risk 3: Permission Denied
**Risk:** App tidak punya permission untuk delete file  
**Mitigation:**
- Proper error handling with user-friendly message
- Log technical details for debugging
- Fallback: Ask user to manually delete via app settings

### Risk 5: Mediator Connection Fails
**Risk:** Wallet restored successfully tapi mediator setup gagal  
**Mitigation:**
- Don't fail entire restore if mediator fails
- Show warning: "Wallet restored but mediator connection failed"
- Provide retry button or manual mediator setup option
- Log mediator error for debugging

### Risk 6: Agent Lifecycle Issues
**Risk:** Agent shutdown/restart tidak proper, causing memory leaks atau crashes  
**Mitigation:**
- Proper shutdown sequence before restore
- Wait for agent to fully shutdown before deleting wallet
- Reinitialize agent properly after import
- Test on both iOS and Android

## Out of Scope
- Wallet migration/merging
- Backup versioning
- Incremental backup/restore
- Cloud backup integration

## References
- Credo-ts Wallet API: https://credo.js.org/guides/tutorials/wallet-management
- Current implementation: `packages/backup/src/`
- Related task: `tasks/tasks-backup-restore.md`
