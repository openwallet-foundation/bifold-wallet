# Restore Wallet Flow - Complete Diagram

## Current Flow (❌ Broken)
```
User picks backup file
    ↓
User enters mnemonic
    ↓
Click "Restore"
    ↓
Try to import wallet
    ↓
❌ ERROR: sqlite.db already exists
```

## New Flow (✅ Fixed)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                               │
│    - Select backup file (.zip)                              │
│    - Enter mnemonic/key                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDATE INPUT                                           │
│    ✓ Check backup file exists                               │
│    ✓ Check mnemonic format                                  │
│    ✓ Unzip backup file                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SHUTDOWN CURRENT AGENT                                   │
│    - agent.shutdown()                                       │
│    - Wait for complete shutdown                             │
│    - Clear agent instance                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DELETE OLD WALLET (if exists)                            │
│    - Check: /afi/wallet/walletId/                           │
│    - If exists: RNFS.unlink(walletDir)                      │
│    - Verify deletion success                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. IMPORT WALLET FROM BACKUP                                │
│    - agent.wallet.import({                                  │
│        path: backupDbPath,                                  │
│        key: mnemonic                                        │
│      })                                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. REINITIALIZE AGENT                                       │
│    - agent.wallet.open({ id, key })                         │
│    - agent.initialize()                                     │
│    - createLinkSecretIfRequired()                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. SETUP MEDIATOR CONNECTION                                │
│    - Get mediatorUrl from preferences                       │
│    - setMediationToDefault(agent, mediatorUrl)              │
│    - Provision mediator connection                          │
│    - Set as default mediator                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. SUCCESS                                                  │
│    ✅ Wallet restored                                        │
│    ✅ Mediator connected                                     │
│    ✅ Ready to receive messages                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling at Each Step

### Step 2: Validate Input
- **Error**: File not found / corrupted
- **Action**: Show error, don't proceed
- **Message**: "Backup file is invalid or corrupted"

### Step 3: Shutdown Agent
- **Error**: Agent shutdown fails
- **Action**: Force shutdown, log warning
- **Message**: Continue with restore

### Step 4: Delete Old Wallet
- **Error**: Permission denied / file locked
- **Action**: Show error, don't proceed
- **Message**: "Cannot delete old wallet. Please close the app and try again"

### Step 5: Import Wallet
- **Error**: Wrong mnemonic / corrupted backup
- **Action**: Show error, restore old wallet if possible
- **Message**: "Failed to import wallet. Incorrect mnemonic or corrupted backup"

### Step 6: Reinitialize Agent
- **Error**: Agent initialization fails
- **Action**: Show error, wallet is imported but not usable
- **Message**: "Wallet imported but failed to initialize. Please restart app"

### Step 7: Setup Mediator
- **Error**: Mediator connection fails
- **Action**: ⚠️ Don't fail entire restore! Show warning
- **Message**: "Wallet restored successfully, but mediator connection failed. You can reconnect manually in Settings"

## Status Messages for User

```typescript
const statusMessages = {
  validating: "Validating backup file...",
  shuttingDown: "Preparing for restore...",
  deletingOld: "Removing old wallet...",
  importing: "Importing wallet from backup...",
  initializing: "Initializing wallet...",
  connectingMediator: "Connecting to mediator...",
  success: "Wallet restored successfully!",
  successWithWarning: "Wallet restored, but mediator connection failed. Please reconnect manually."
}
```

## Key Differences from Current Implementation

| Aspect | Current | New |
|--------|---------|-----|
| **Wallet ID** | Hardcoded `'walletId'` | Same, but with proper cleanup |
| **Old Wallet** | ❌ Not handled → Error | ✅ Auto-deleted before restore |
| **Agent State** | ❌ Not managed | ✅ Proper shutdown/restart |
| **Mediator** | ❌ Not reconnected | ✅ Auto-reconnected after restore |
| **Error Handling** | ❌ Generic errors | ✅ Specific, actionable errors |
| **User Feedback** | ❌ No progress | ✅ Step-by-step status |

## Testing Scenarios

### Scenario 1: First Time Restore (No Existing Wallet)
- ✅ Should work smoothly
- ✅ Mediator should connect
- ✅ User can receive messages

### Scenario 2: Restore Over Existing Wallet
- ✅ Old wallet should be deleted
- ✅ New wallet should be imported
- ✅ Mediator should reconnect
- ✅ No "already exists" error

### Scenario 3: Restore with Wrong Mnemonic
- ✅ Should fail at import step
- ✅ Old wallet should NOT be deleted
- ✅ Clear error message shown

### Scenario 4: Restore with Mediator Offline
- ✅ Wallet should still be restored
- ⚠️ Mediator connection fails (warning only)
- ✅ User can retry mediator setup later

### Scenario 5: Restore While App is Active
- ✅ Agent should shutdown gracefully
- ✅ Restore should proceed
- ✅ Agent should reinitialize
- ✅ User returns to home screen
