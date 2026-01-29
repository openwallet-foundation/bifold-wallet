# Design: SSI-Compliant Backup & Restore

## 1. Overview

This document provides the technical design for implementing SSI-compliant backup and restore functionality that aligns with BIP39, Aries RFC 0050, and W3C DID Core standards.

### 1.1. Design Goals

**Primary Goals:**
1. ✅ Wallet key MUST be derived from mnemonic (BIP39 standard)
2. ✅ Backup MUST be self-contained (no keychain dependency)
3. ✅ Restore MUST work on any device with only backup + mnemonic
4. ✅ Achieve 90%+ SSI compliance (from current 50%)

**Secondary Goals:**
1. ✅ Maintain PIN convenience for daily use
2. ✅ Support biometric authentication
3. ✅ Provide smooth migration for existing users
4. ✅ Maintain backward compatibility during migration period

### 1.2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SSI-Compliant Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mnemonic (12 words) ──────────────────────────────────┐    │
│       │                                                  │    │
│       │ BIP39 PBKDF2                                     │    │
│       ↓                                                  │    │
│  Master Seed (512-bit) ────────────────────────────────┐│    │
│       │                                                 ││    │
│       │ BIP32 Derivation (m/44'/0'/0'/0/0)             ││    │
│       ↓                                                 ││    │
│  Wallet Key (256-bit) ──────────────────────────────┐  ││    │
│       │                                              │  ││    │
│       │ Create/Open Wallet                           │  ││    │
│       ↓                                              │  ││    │
│  Aries Wallet (Askar)                                │  ││    │
│       │                                              │  ││    │
│       │ Export                                       │  ││    │
│       ↓                                              │  ││    │
│  Backup File (encrypted with mnemonic) ─────────────┼──┼┼────│
│                                                      │  ││    │
│  PIN (user convenience) ──────────────────────┐     │  ││    │
│       │                                        │     │  ││    │
│       │ Encrypt                                │     │  ││    │
│       ↓                                        │     │  ││    │
│  Encrypted Mnemonic ──────────────────────────┼─────┼──┼┘    │
│       │                                        │     │  │     │
│       │ Store                                  │     │  │     │
│       ↓                                        │     │  │     │
│  Keychain (platform secure storage)           │     │  │     │
│                                                │     │  │     │
│  ✅ Fully Portable: Only need mnemonic ───────┴─────┴──┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Key Derivation Design

### 2.1. BIP39 Implementation

**Mnemonic Generation:**
```typescript
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39'

/**
 * Generate a new BIP39 mnemonic
 * @returns 12-word mnemonic phrase
 */
function generateWalletMnemonic(): string {
  // 128 bits = 12 words
  // 256 bits = 24 words (we use 12 for simplicity)
  return generateMnemonic(128)
}

/**
 * Validate mnemonic checksum
 * @param mnemonic The mnemonic to validate
 * @returns true if valid, false otherwise
 */
function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic)
}
```

**Master Seed Derivation:**
```typescript
/**
 * Derive master seed from mnemonic using BIP39 PBKDF2
 * @param mnemonic The 12-word mnemonic
 * @param passphrase Optional passphrase (default: empty)
 * @returns 512-bit master seed
 */
function deriveMasterSeed(mnemonic: string, passphrase: string = ''): Buffer {
  // BIP39 standard: PBKDF2-SHA512 with 2048 iterations
  // Salt: "mnemonic" + passphrase
  return mnemonicToSeedSync(mnemonic, passphrase)
}
```

### 2.2. Wallet Key Derivation

**BIP32 Derivation Path:**
```typescript
import { BIP32Factory } from 'bip32'
import * as ecc from 'tiny-secp256k1'

const bip32 = BIP32Factory(ecc)

/**
 * Derive wallet key from master seed using BIP32
 * @param masterSeed The 512-bit master seed from BIP39
 * @returns 256-bit wallet key
 */
function deriveWalletKey(masterSeed: Buffer): string {
  // BIP32 derivation path: m/44'/0'/0'/0/0
  // m/44' = BIP44 purpose
  // 0' = coin type (0 for Bitcoin, we use 0 for SSI)
  // 0' = account
  // 0 = external chain
  // 0 = address index
  
  const root = bip32.fromSeed(masterSeed)
  const child = root.derivePath("m/44'/0'/0'/0/0")
  
  // Use private key as wallet key (32 bytes = 256 bits)
  if (!child.privateKey) {
    throw new Error('Failed to derive private key')
  }
  
  // Convert to hex string for Aries Askar
  return child.privateKey.toString('hex')
}
```

**Complete Key Derivation Flow:**
```typescript
/**
 * Complete flow: Mnemonic → Master Seed → Wallet Key
 * @param mnemonic The 12-word BIP39 mnemonic
 * @returns Wallet key for Aries Askar
 */
export function deriveWalletKeyFromMnemonic(mnemonic: string): string {
  // Step 1: Validate mnemonic
  if (!isValidMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic checksum')
  }
  
  // Step 2: Derive master seed (BIP39)
  const masterSeed = deriveMasterSeed(mnemonic)
  
  // Step 3: Derive wallet key (BIP32)
  const walletKey = deriveWalletKey(masterSeed)
  
  return walletKey
}
```

### 2.3. Security Considerations

**Key Properties:**
- ✅ Deterministic: Same mnemonic always produces same wallet key
- ✅ One-way: Cannot derive mnemonic from wallet key
- ✅ Standard: Compatible with other BIP39/BIP32 wallets
- ✅ Secure: Uses industry-standard cryptography (PBKDF2, ECDSA)

**Key Storage:**
- ❌ Wallet key: NEVER stored (always derived from mnemonic)
- ✅ Mnemonic: Encrypted with PIN, stored in keychain
- ✅ PIN: Never stored (only used to decrypt mnemonic)

## 3. Onboarding Flow Design

### 3.1. New Wallet Creation

**Flow Diagram:**
```
┌──────────────────────────────────────────────────────────┐
│ Step 1: Generate Mnemonic                                │
├──────────────────────────────────────────────────────────┤
│ • Generate 12-word BIP39 mnemonic                        │
│ • Validate checksum                                      │
│ • Store in memory (temporary)                            │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Display Mnemonic to User                         │
├──────────────────────────────────────────────────────────┤
│ • Show 12 words in grid                                  │
│ • Warn: "Write down, don't screenshot"                   │
│ • Allow copy to clipboard                                │
│ • Require user confirmation                              │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Verify Mnemonic                                  │
├──────────────────────────────────────────────────────────┤
│ • Ask user to select 3 random words                      │
│ • Verify correctness                                     │
│ • Retry if wrong (max 3 attempts)                        │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Derive Wallet Key                                │
├──────────────────────────────────────────────────────────┤
│ • masterSeed = mnemonicToSeed(mnemonic)                  │
│ • walletKey = deriveWalletKey(masterSeed)                │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Create Wallet                                    │
├──────────────────────────────────────────────────────────┤
│ • agent.wallet.create({                                  │
│     id: 'walletId',                                      │
│     key: walletKey  // Derived from mnemonic!            │
│   })                                                     │
│ • agent.wallet.open({ id, key: walletKey })              │
│ • agent.initialize()                                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 6: Set PIN                                          │
├──────────────────────────────────────────────────────────┤
│ • Prompt user for PIN (6 digits)                         │
│ • Confirm PIN                                            │
│ • Optional: Enable biometrics                            │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 7: Encrypt & Store Mnemonic                         │
├──────────────────────────────────────────────────────────┤
│ • encryptedMnemonic = encrypt(mnemonic, PIN)             │
│ • keychain.store({                                       │
│     encryptedMnemonic,                                   │
│     useBiometrics                                        │
│   })                                                     │
│ • Clear mnemonic from memory                             │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 8: Setup Mediator                                   │
├──────────────────────────────────────────────────────────┤
│ • Connect to mediator                                    │
│ • Setup mediation                                        │
│ • Ready to use!                                          │
└──────────────────────────────────────────────────────────┘
```


### 3.2. Implementation Code

**OnboardingScreen.tsx:**
```typescript
import { deriveWalletKeyFromMnemonic, generateWalletMnemonic } from '../services/KeyDerivation'
import { encryptMnemonic, storeMnemonicInKeychain } from '../services/MnemonicStorage'

export const OnboardingScreen = () => {
  const [mnemonic, setMnemonic] = useState<string>('')
  const [step, setStep] = useState<'generate' | 'display' | 'verify' | 'pin' | 'complete'>('generate')
  
  // Step 1: Generate mnemonic
  const handleGenerateMnemonic = () => {
    const newMnemonic = generateWalletMnemonic()
    setMnemonic(newMnemonic)
    setStep('display')
  }
  
  // Step 2-3: Display and verify (UI components)
  
  // Step 4-5: Create wallet
  const handleCreateWallet = async () => {
    try {
      // Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Create wallet with derived key
      await agent.wallet.create({
        id: 'walletId',
        key: walletKey,
      })
      
      await agent.wallet.open({
        id: 'walletId',
        key: walletKey,
      })
      
      await agent.initialize()
      
      setStep('pin')
    } catch (error) {
      // Handle error
    }
  }
  
  // Step 6-7: Set PIN and store mnemonic
  const handleSetPIN = async (pin: string, useBiometrics: boolean) => {
    try {
      // Encrypt mnemonic with PIN
      const encryptedMnemonic = await encryptMnemonic(mnemonic, pin)
      
      // Store in keychain
      await storeMnemonicInKeychain(encryptedMnemonic, useBiometrics)
      
      // Clear mnemonic from memory
      setMnemonic('')
      
      setStep('complete')
    } catch (error) {
      // Handle error
    }
  }
  
  // Render based on step
  return (
    <View>
      {step === 'generate' && <GenerateButton onPress={handleGenerateMnemonic} />}
      {step === 'display' && <DisplayMnemonic mnemonic={mnemonic} onNext={() => setStep('verify')} />}
      {step === 'verify' && <VerifyMnemonic mnemonic={mnemonic} onVerified={handleCreateWallet} />}
      {step === 'pin' && <SetPINScreen onPINSet={handleSetPIN} />}
      {step === 'complete' && <CompleteScreen />}
    </View>
  )
}
```

## 4. Daily Access Flow Design

### 4.1. Wallet Open Flow

**Flow Diagram:**
```
┌──────────────────────────────────────────────────────────┐
│ App Start                                                │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 1: Prompt for Authentication                        │
├──────────────────────────────────────────────────────────┤
│ • Show PIN input screen                                  │
│ • Or biometric prompt (if enabled)                       │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Load Encrypted Mnemonic from Keychain           │
├──────────────────────────────────────────────────────────┤
│ • encryptedData = keychain.load()                        │
│ • Verify keychain data exists                            │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Decrypt Mnemonic with PIN                        │
├──────────────────────────────────────────────────────────┤
│ • mnemonic = decrypt(encryptedData, PIN)                 │
│ • Validate mnemonic checksum                             │
│ • Handle wrong PIN (max 3 attempts)                      │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Derive Wallet Key from Mnemonic                 │
├──────────────────────────────────────────────────────────┤
│ • masterSeed = mnemonicToSeed(mnemonic)                  │
│ • walletKey = deriveWalletKey(masterSeed)                │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Open Wallet                                      │
├──────────────────────────────────────────────────────────┤
│ • agent.wallet.open({                                    │
│     id: 'walletId',                                      │
│     key: walletKey  // Derived from mnemonic!            │
│   })                                                     │
│ • agent.initialize()                                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 6: Clear Sensitive Data                             │
├──────────────────────────────────────────────────────────┤
│ • Clear mnemonic from memory                             │
│ • Clear wallet key from memory                           │
│ • Keep only agent instance                               │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Wallet Ready                                             │
└──────────────────────────────────────────────────────────┘
```

### 4.2. Implementation Code

**useBifoldAgentSetup.ts:**
```typescript
import { deriveWalletKeyFromMnemonic } from '../services/KeyDerivation'
import { loadMnemonicFromKeychain, decryptMnemonic } from '../services/MnemonicStorage'

export const useBifoldAgentSetup = () => {
  const openWallet = async (pin: string) => {
    try {
      // Step 2: Load encrypted mnemonic from keychain
      const encryptedData = await loadMnemonicFromKeychain()
      
      if (!encryptedData) {
        throw new Error('No wallet found. Please create or restore a wallet.')
      }
      
      // Step 3: Decrypt mnemonic with PIN
      const mnemonic = await decryptMnemonic(encryptedData, pin)
      
      // Validate mnemonic
      if (!validateMnemonic(mnemonic)) {
        throw new Error('Corrupted wallet data. Please restore from backup.')
      }
      
      // Step 4: Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Step 5: Open wallet
      await agent.wallet.open({
        id: 'walletId',
        key: walletKey,
      })
      
      await agent.initialize()
      
      // Step 6: Clear sensitive data
      // (mnemonic and walletKey will be garbage collected)
      
      return { success: true }
    } catch (error) {
      if (error.message.includes('Incorrect key')) {
        throw new Error('Incorrect PIN')
      }
      throw error
    }
  }
  
  return { openWallet }
}
```

**AuthContext.tsx:**
```typescript
export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { openWallet } = useBifoldAgentSetup()
  
  const authenticate = async (pin: string) => {
    try {
      await openWallet(pin)
      setAuthenticated(true)
      setAttempts(0)
      return { success: true }
    } catch (error) {
      setAttempts(prev => prev + 1)
      
      if (attempts >= 2) {
        // Max attempts reached, offer mnemonic recovery
        return { 
          success: false, 
          error: 'Max attempts reached. Use mnemonic to recover.',
          showMnemonicRecovery: true
        }
      }
      
      return { 
        success: false, 
        error: error.message,
        attemptsLeft: 3 - attempts - 1
      }
    }
  }
  
  return (
    <AuthContext.Provider value={{ authenticated, authenticate }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 5. Backup Flow Design

### 5.1. Wallet Export Flow

**Flow Diagram:**
```
┌──────────────────────────────────────────────────────────┐
│ User Initiates Backup                                    │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 1: Verify Authentication                            │
├──────────────────────────────────────────────────────────┤
│ • Prompt for PIN (or biometric)                          │
│ • Decrypt mnemonic from keychain                         │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Export Wallet Database                           │
├──────────────────────────────────────────────────────────┤
│ • agent.wallet.export({                                  │
│     path: tempPath,                                      │
│     key: mnemonic  // Encrypt with mnemonic!             │
│   })                                                     │
│ • Creates encrypted sqlite.db file                       │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Create Backup Package                            │
├──────────────────────────────────────────────────────────┤
│ • Zip the database file                                  │
│ • Add metadata (version, date, etc.)                     │
│ • Create backup.zip                                      │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Share Backup File                                │
├──────────────────────────────────────────────────────────┤
│ • Open share sheet                                       │
│ • User can save to files, cloud, etc.                    │
│ • Cleanup temp files                                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Display Mnemonic                                 │
├──────────────────────────────────────────────────────────┤
│ • Show mnemonic to user                                  │
│ • Warn: "Keep this safe!"                                │
│ • Allow copy to clipboard                                │
│ • Remind: "Backup file + mnemonic = full recovery"       │
└──────────────────────────────────────────────────────────┘
```

**Key Points:**
- ✅ Backup file is encrypted with mnemonic (not PIN!)
- ✅ Mnemonic is displayed to user (they need it for restore)
- ✅ Backup is self-contained (no keychain dependency)
- ✅ User has everything needed: backup.zip + mnemonic

### 5.2. Implementation Code

**BackupService.ts:**
```typescript
export class BackupService {
  /**
   * Export wallet with mnemonic encryption
   * @param agent The agent instance
   * @param pin User's PIN (to decrypt mnemonic from keychain)
   * @returns The mnemonic (user needs this for restore)
   */
  public async exportWallet(agent: Agent, pin: string): Promise<string> {
    try {
      // Step 1: Load and decrypt mnemonic
      const encryptedData = await loadMnemonicFromKeychain()
      const mnemonic = await decryptMnemonic(encryptedData, pin)
      
      // Step 2: Export wallet encrypted with mnemonic
      const tempPath = `${RNFS.CachesDirectoryPath}/backup_export/sqlite.db`
      await agent.wallet.export({
        path: tempPath,
        key: mnemonic,  // Encrypt with mnemonic!
      })
      
      // Step 3: Create zip
      const zipPath = `${RNFS.CachesDirectoryPath}/backup.zip`
      await zip(path.dirname(tempPath), zipPath)
      
      // Step 4: Share
      await Share.open({
        url: `file://${zipPath}`,
        type: 'application/zip',
      })
      
      // Step 5: Return mnemonic (user needs to save it!)
      return mnemonic
    } finally {
      // Cleanup
      await this.cleanup()
    }
  }
}
```

**BackupScreen.tsx:**
```typescript
export const BackupScreen = () => {
  const [mnemonic, setMnemonic] = useState<string>('')
  const [step, setStep] = useState<'auth' | 'export' | 'display'>('auth')
  const backupService = new BackupService()
  
  const handleBackup = async (pin: string) => {
    try {
      setStep('export')
      
      // Export wallet and get mnemonic
      const recoveryMnemonic = await backupService.exportWallet(agent, pin)
      
      setMnemonic(recoveryMnemonic)
      setStep('display')
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <View>
      {step === 'auth' && <PINInput onSubmit={handleBackup} />}
      {step === 'export' && <LoadingIndicator message="Creating backup..." />}
      {step === 'display' && (
        <MnemonicDisplay 
          mnemonic={mnemonic}
          title="Save Your Recovery Phrase"
          message="You need BOTH the backup file AND this recovery phrase to restore your wallet."
        />
      )}
    </View>
  )
}
```

## 6. Restore Flow Design

### 6.1. Portable Restore Flow

**Flow Diagram:**
```
┌──────────────────────────────────────────────────────────┐
│ User Initiates Restore (New Device)                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 1: Select Backup File                               │
├──────────────────────────────────────────────────────────┤
│ • Open file picker                                       │
│ • User selects backup.zip                                │
│ • Validate file (exists, not empty, valid zip)           │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Input Mnemonic                                   │
├──────────────────────────────────────────────────────────┤
│ • Show mnemonic input (12 words)                         │
│ • Validate mnemonic checksum                             │
│ • Verify mnemonic is correct                             │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Derive Wallet Key from Mnemonic                 │
├──────────────────────────────────────────────────────────┤
│ • masterSeed = mnemonicToSeed(mnemonic)                  │
│ • walletKey = deriveWalletKey(masterSeed)                │
│ • ✅ No keychain needed!                                 │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Import Wallet                                    │
├──────────────────────────────────────────────────────────┤
│ • Unzip backup file                                      │
│ • agent.wallet.import({                                  │
│     id: 'walletId',                                      │
│     key: walletKey  // Derived from mnemonic!            │
│   }, {                                                   │
│     path: dbPath,                                        │
│     key: mnemonic  // To decrypt backup                  │
│   })                                                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Open Wallet                                      │
├──────────────────────────────────────────────────────────┤
│ • agent.wallet.open({                                    │
│     id: 'walletId',                                      │
│     key: walletKey                                       │
│   })                                                     │
│ • agent.initialize()                                     │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 6: Set New PIN                                      │
├──────────────────────────────────────────────────────────┤
│ • Prompt for new PIN                                     │
│ • Optional: Enable biometrics                            │
│ • encryptedMnemonic = encrypt(mnemonic, newPIN)          │
│ • keychain.store(encryptedMnemonic)                      │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 7: Reconnect Mediator                               │
├──────────────────────────────────────────────────────────┤
│ • Connect to mediator                                    │
│ • Setup mediation                                        │
│ • Sync messages                                          │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Restore Complete!                                        │
├──────────────────────────────────────────────────────────┤
│ ✅ Wallet restored on new device                         │
│ ✅ All credentials present                               │
│ ✅ No dependency on old keychain                         │
│ ✅ Fully portable!                                       │
└──────────────────────────────────────────────────────────┘
```


### 6.2. Implementation Code

**RestoreWalletScreen.tsx:**
```typescript
import { deriveWalletKeyFromMnemonic } from '../services/KeyDerivation'
import { encryptMnemonic, storeMnemonicInKeychain } from '../services/MnemonicStorage'

export const RestoreWalletScreen = () => {
  const [backupFile, setBackupFile] = useState<string>('')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [step, setStep] = useState<'file' | 'mnemonic' | 'restore' | 'pin' | 'complete'>('file')
  const backupService = new BackupService()
  
  // Step 1: Select backup file
  const handleSelectFile = async () => {
    const filePath = await backupService.pickBackupFile()
    if (filePath) {
      setBackupFile(filePath)
      setStep('mnemonic')
    }
  }
  
  // Step 2-7: Restore wallet
  const handleRestore = async () => {
    try {
      setStep('restore')
      
      // Step 3: Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Step 4-5: Import and open wallet
      await backupService.restoreWalletComplete(
        agent,
        backupFile,
        mnemonic,      // To decrypt backup
        {
          id: 'walletId',
          key: walletKey,  // Derived from mnemonic!
        },
        mediatorUrl,
        (status) => {
          // Update progress UI
        }
      )
      
      setStep('pin')
    } catch (error) {
      // Handle error
    }
  }
  
  // Step 6: Set new PIN
  const handleSetPIN = async (pin: string, useBiometrics: boolean) => {
    try {
      // Encrypt mnemonic with new PIN
      const encryptedMnemonic = await encryptMnemonic(mnemonic, pin)
      
      // Store in keychain on new device
      await storeMnemonicInKeychain(encryptedMnemonic, useBiometrics)
      
      // Clear mnemonic from memory
      setMnemonic('')
      
      setStep('complete')
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <View>
      {step === 'file' && <FilePickerButton onPress={handleSelectFile} />}
      {step === 'mnemonic' && (
        <MnemonicInput 
          onSubmit={(words) => {
            setMnemonic(words)
            handleRestore()
          }}
        />
      )}
      {step === 'restore' && <LoadingIndicator message="Restoring wallet..." />}
      {step === 'pin' && <SetPINScreen onPINSet={handleSetPIN} />}
      {step === 'complete' && <CompleteScreen />}
    </View>
  )
}
```

**BackupService.ts (Updated):**
```typescript
export class BackupService {
  /**
   * Complete restore flow with mnemonic-derived key
   * @param agent The agent instance
   * @param backupFilePath Path to backup file
   * @param mnemonic The recovery mnemonic (for decryption AND key derivation)
   * @param walletConfig Wallet config with derived key
   * @param mediatorUrl Mediator URL
   * @param onProgress Progress callback
   */
  public async restoreWalletComplete(
    agent: Agent,
    backupFilePath: string,
    mnemonic: string,
    walletConfig: WalletConfig,
    mediatorUrl: string,
    onProgress?: (status: RestoreStatus) => void
  ): Promise<void> {
    // Validate inputs
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic')
    }
    
    // Verify wallet key is derived from mnemonic
    const expectedKey = deriveWalletKeyFromMnemonic(mnemonic)
    if (walletConfig.key !== expectedKey) {
      throw new Error('Wallet key must be derived from mnemonic')
    }
    
    // Step 1: Validate backup file
    onProgress?.(RestoreStatus.VALIDATING)
    await this.validateBackupFile(backupFilePath)
    
    // Step 2: Close current wallet
    onProgress?.(RestoreStatus.SHUTTING_DOWN)
    if (agent.wallet.isInitialized) {
      await agent.wallet.close()
    }
    
    // Step 3: Delete old wallet
    onProgress?.(RestoreStatus.DELETING_OLD)
    await this.deleteWallet(walletConfig.id)
    
    // Step 4: Import wallet
    onProgress?.(RestoreStatus.IMPORTING)
    await this.importWallet(
      agent,
      backupFilePath,
      mnemonic,      // To decrypt backup
      walletConfig   // With derived key
    )
    
    // Step 5: Open wallet
    onProgress?.(RestoreStatus.INITIALIZING)
    await agent.wallet.open({
      id: walletConfig.id,
      key: walletConfig.key,  // Derived key
    })
    
    if (!agent.isInitialized) {
      await agent.initialize()
    }
    
    // Step 6: Setup mediator
    onProgress?.(RestoreStatus.CONNECTING_MEDIATOR)
    try {
      await setMediationToDefault(agent, mediatorUrl)
    } catch (error) {
      // Don't fail restore if mediator fails
    }
    
    // Step 7: Success
    onProgress?.(RestoreStatus.SUCCESS)
  }
}
```

## 7. Migration Design

### 7.1. Migration Strategy

**Detection Logic:**
```typescript
/**
 * Detect if wallet is using old format (PIN-based key)
 * @returns true if migration needed, false if already migrated
 */
export async function needsMigration(): Promise<boolean> {
  try {
    // Check keychain structure
    const keychainData = await loadFromKeychain()
    
    // Old format: { id, key, salt } (wallet secret)
    // New format: { encryptedMnemonic, useBiometrics }
    
    if (keychainData.encryptedMnemonic) {
      // New format detected
      return false
    }
    
    if (keychainData.key && keychainData.salt) {
      // Old format detected
      return true
    }
    
    // No wallet found
    return false
  } catch (error) {
    return false
  }
}
```

**Migration Flow:**
```
┌──────────────────────────────────────────────────────────┐
│ App Start (Existing User)                                │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 1: Detect Old Format                                │
├──────────────────────────────────────────────────────────┤
│ • Check keychain structure                               │
│ • If old format detected → show migration prompt         │
│ • If new format → proceed normally                       │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Show Migration Prompt                            │
├──────────────────────────────────────────────────────────┤
│ • Explain benefits of migration                          │
│ • Warn: "Backup first!"                                  │
│ • Options:                                               │
│   - Migrate Now (recommended)                            │
│   - Remind Me Later (max 3 times)                        │
│   - Learn More                                           │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: Backup Old Wallet                                │
├──────────────────────────────────────────────────────────┤
│ • Force user to create backup                            │
│ • Export with old format (PIN-based)                     │
│ • Verify backup created successfully                     │
│ • Store backup path for rollback                         │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Generate Mnemonic                                │
├──────────────────────────────────────────────────────────┤
│ • Generate new 12-word mnemonic                          │
│ • Display to user                                        │
│ • Require user to write down                             │
│ • Verify user saved it                                   │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Export Old Wallet Data                           │
├──────────────────────────────────────────────────────────┤
│ • Open old wallet with PIN-based key                     │
│ • Export all data (credentials, DIDs, connections)       │
│ • Create temporary backup                                │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 6: Create New Wallet                                │
├──────────────────────────────────────────────────────────┤
│ • Derive wallet key from mnemonic                        │
│ • Create new wallet with derived key                     │
│ • Import all data from old wallet                        │
│ • Verify data integrity                                  │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 7: Update Keychain                                  │
├──────────────────────────────────────────────────────────┤
│ • Prompt for PIN (can be same or new)                    │
│ • Encrypt mnemonic with PIN                              │
│ • Store encrypted mnemonic in keychain                   │
│ • Delete old wallet secret                               │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 8: Verify Migration                                 │
├──────────────────────────────────────────────────────────┤
│ • Close and reopen wallet                                │
│ • Verify all credentials present                         │
│ • Verify connections work                                │
│ • Test backup/restore with new format                    │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Step 9: Cleanup                                           │
├──────────────────────────────────────────────────────────┤
│ • Delete old wallet files                                │
│ • Keep old backup for grace period (30 days)             │
│ • Mark migration as complete                             │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ Migration Complete!                                      │
├──────────────────────────────────────────────────────────┤
│ ✅ Wallet now uses mnemonic-derived key                  │
│ ✅ Fully portable                                        │
│ ✅ SSI compliant                                         │
└──────────────────────────────────────────────────────────┘
```

### 7.2. Migration Implementation

**MigrationService.ts:**
```typescript
export class MigrationService {
  /**
   * Migrate wallet from old format (PIN-based) to new format (mnemonic-based)
   * @param agent The agent instance
   * @param pin User's current PIN
   * @param newPin New PIN (can be same as old)
   * @param onProgress Progress callback
   * @returns The new mnemonic (user must save it!)
   */
  public async migrateWallet(
    agent: Agent,
    pin: string,
    newPin: string,
    onProgress?: (step: string) => void
  ): Promise<string> {
    try {
      // Step 3: Backup old wallet
      onProgress?.('Creating backup of old wallet...')
      const backupPath = await this.backupOldWallet(agent, pin)
      
      // Step 4: Generate mnemonic
      onProgress?.('Generating recovery phrase...')
      const mnemonic = generateWalletMnemonic()
      
      // Step 5: Export old wallet data
      onProgress?.('Exporting wallet data...')
      const oldWalletData = await this.exportOldWalletData(agent)
      
      // Step 6: Create new wallet
      onProgress?.('Creating new wallet...')
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
      
      // Close old wallet
      await agent.wallet.close()
      
      // Delete old wallet
      await this.deleteWallet('walletId')
      
      // Create new wallet with derived key
      await agent.wallet.create({
        id: 'walletId',
        key: walletKey,
      })
      
      await agent.wallet.open({
        id: 'walletId',
        key: walletKey,
      })
      
      // Import old data
      await this.importWalletData(agent, oldWalletData)
      
      // Step 7: Update keychain
      onProgress?.('Updating secure storage...')
      const encryptedMnemonic = await encryptMnemonic(mnemonic, newPin)
      await storeMnemonicInKeychain(encryptedMnemonic, false)
      
      // Delete old wallet secret
      await this.deleteOldWalletSecret()
      
      // Step 8: Verify
      onProgress?.('Verifying migration...')
      await this.verifyMigration(agent, mnemonic, newPin)
      
      // Step 9: Cleanup
      onProgress?.('Cleaning up...')
      await this.cleanup(backupPath)
      
      // Mark migration complete
      await this.markMigrationComplete()
      
      return mnemonic
    } catch (error) {
      // Rollback on error
      await this.rollback(backupPath, pin)
      throw error
    }
  }
  
  /**
   * Rollback migration if it fails
   */
  private async rollback(backupPath: string, pin: string): Promise<void> {
    try {
      // Restore old wallet from backup
      // ... rollback logic ...
    } catch (error) {
      // Log error but don't throw (already in error state)
    }
  }
}
```

**MigrationScreen.tsx:**
```typescript
export const MigrationScreen = () => {
  const [step, setStep] = useState<'prompt' | 'backup' | 'mnemonic' | 'migrate' | 'complete'>('prompt')
  const [mnemonic, setMnemonic] = useState<string>('')
  const migrationService = new MigrationService()
  
  const handleMigrate = async (pin: string, newPin: string) => {
    try {
      setStep('migrate')
      
      const recoveryMnemonic = await migrationService.migrateWallet(
        agent,
        pin,
        newPin,
        (progress) => {
          // Update progress UI
        }
      )
      
      setMnemonic(recoveryMnemonic)
      setStep('complete')
    } catch (error) {
      // Handle error
    }
  }
  
  return (
    <View>
      {step === 'prompt' && (
        <MigrationPrompt 
          onMigrate={() => setStep('backup')}
          onPostpone={() => {/* ... */}}
        />
      )}
      {step === 'backup' && (
        <BackupPrompt onBackupComplete={() => setStep('mnemonic')} />
      )}
      {step === 'mnemonic' && (
        <MnemonicDisplay 
          mnemonic={mnemonic}
          onConfirmed={() => handleMigrate(pin, newPin)}
        />
      )}
      {step === 'migrate' && <LoadingIndicator message="Migrating wallet..." />}
      {step === 'complete' && (
        <MigrationComplete 
          mnemonic={mnemonic}
          message="Your wallet is now fully portable!"
        />
      )}
    </View>
  )
}
```

## 8. Security Design

### 8.1. Threat Model

**Threats Addressed:**
1. ✅ Keychain corruption → Can restore with mnemonic
2. ✅ Platform migration → Fully portable
3. ✅ App reinstall → Can restore with mnemonic
4. ✅ Device loss → Can restore on new device
5. ✅ Backup theft → Encrypted with mnemonic (strong KDF)
6. ✅ PIN compromise → Mnemonic still safe (if not stored with PIN)

**Threats NOT Addressed:**
1. ❌ Mnemonic compromise → Wallet fully compromised (user responsibility)
2. ❌ Physical device access → PIN/biometric protection only
3. ❌ Malware on device → Can steal mnemonic from memory
4. ❌ Social engineering → User gives away mnemonic

### 8.2. Cryptographic Design

**Key Hierarchy:**
```
Mnemonic (12 words, 128 bits entropy)
    ↓ BIP39 PBKDF2-SHA512 (2048 iterations)
Master Seed (512 bits)
    ↓ BIP32 ECDSA (secp256k1)
Wallet Key (256 bits)
    ↓ Aries Askar (ChaCha20-Poly1305)
Wallet Database (encrypted)
```

**Encryption Layers:**
1. **Mnemonic → Master Seed**: BIP39 PBKDF2-SHA512
2. **Master Seed → Wallet Key**: BIP32 ECDSA
3. **Wallet Key → Database**: ChaCha20-Poly1305 (AEAD)
4. **Mnemonic → Backup**: Argon2 + ChaCha20-Poly1305
5. **PIN → Mnemonic**: AES-256-GCM (keychain)

**Security Properties:**
- ✅ Forward secrecy: Compromised wallet key doesn't reveal mnemonic
- ✅ Deterministic: Same mnemonic always produces same keys
- ✅ Standard: Uses industry-standard algorithms
- ✅ Auditable: All algorithms are well-documented
- ✅ Quantum-resistant: Can upgrade to post-quantum algorithms later

### 8.3. Key Storage Security

**Mnemonic Storage:**
```typescript
// NEVER store mnemonic in plain text!
// ALWAYS encrypt with PIN before storing

// ✅ Correct:
const encryptedMnemonic = await encrypt(mnemonic, pin, {
  algorithm: 'AES-256-GCM',
  iterations: 100000,  // PBKDF2 iterations
  salt: randomBytes(32),
})
await keychain.store({ encryptedMnemonic })

// ❌ Wrong:
await keychain.store({ mnemonic })  // NEVER DO THIS!
```

**Memory Security:**
```typescript
// Clear sensitive data from memory after use
function useMnemonic(mnemonic: string) {
  try {
    const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
    // Use wallet key...
    return walletKey
  } finally {
    // Clear mnemonic from memory
    // (JavaScript doesn't have explicit memory control,
    //  but we can at least clear the variable)
    mnemonic = ''
  }
}
```

## 9. Performance Design

### 9.1. Performance Targets

**Key Derivation:**
- Target: < 1 second on modern devices
- Acceptable: < 2 seconds on low-end devices
- Critical: < 5 seconds on any device

**Wallet Operations:**
- Open wallet: < 2 seconds
- Create backup: < 10 seconds
- Restore wallet: < 60 seconds (typical)
- Migration: < 5 minutes

### 9.2. Optimization Strategies

**Caching:**
```typescript
// Cache derived key in memory during session
class WalletKeyCache {
  private cachedKey: string | null = null
  private cachedMnemonic: string | null = null
  
  public getKey(mnemonic: string): string {
    // Return cached key if mnemonic matches
    if (this.cachedMnemonic === mnemonic && this.cachedKey) {
      return this.cachedKey
    }
    
    // Derive new key
    const key = deriveWalletKeyFromMnemonic(mnemonic)
    
    // Cache for future use
    this.cachedMnemonic = mnemonic
    this.cachedKey = key
    
    return key
  }
  
  public clear() {
    this.cachedKey = null
    this.cachedMnemonic = null
  }
}
```

**Lazy Loading:**
```typescript
// Don't derive key until needed
export const useWalletKey = () => {
  const [key, setKey] = useState<string | null>(null)
  
  const deriveKey = async (mnemonic: string) => {
    // Show loading indicator
    setLoading(true)
    
    // Derive key in background
    const derivedKey = await deriveWalletKeyFromMnemonic(mnemonic)
    
    setKey(derivedKey)
    setLoading(false)
  }
  
  return { key, deriveKey }
}
```

## 10. Testing Strategy

### 10.1. Unit Tests

**Key Derivation Tests:**
```typescript
describe('Key Derivation', () => {
  it('should generate valid mnemonic', () => {
    const mnemonic = generateWalletMnemonic()
    expect(validateMnemonic(mnemonic)).toBe(true)
  })
  
  it('should derive same key from same mnemonic', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    const key1 = deriveWalletKeyFromMnemonic(mnemonic)
    const key2 = deriveWalletKeyFromMnemonic(mnemonic)
    expect(key1).toBe(key2)
  })
  
  it('should derive different keys from different mnemonics', () => {
    const mnemonic1 = generateWalletMnemonic()
    const mnemonic2 = generateWalletMnemonic()
    const key1 = deriveWalletKeyFromMnemonic(mnemonic1)
    const key2 = deriveWalletKeyFromMnemonic(mnemonic2)
    expect(key1).not.toBe(key2)
  })
})
```

### 10.2. Integration Tests

**Restore Flow Tests:**
```typescript
describe('Restore Flow', () => {
  it('should restore wallet on new device', async () => {
    // 1. Create wallet on device A
    const mnemonic = generateWalletMnemonic()
    const walletKey = deriveWalletKeyFromMnemonic(mnemonic)
    await agent.wallet.create({ id: 'test', key: walletKey })
    
    // 2. Add some credentials
    await addTestCredentials(agent)
    
    // 3. Export backup
    const backupPath = await exportWallet(agent, mnemonic)
    
    // 4. Simulate new device (delete wallet)
    await agent.wallet.close()
    await deleteWallet('test')
    
    // 5. Restore on "new device"
    const restoredKey = deriveWalletKeyFromMnemonic(mnemonic)
    await agent.wallet.import({ id: 'test', key: restoredKey }, {
      path: backupPath,
      key: mnemonic,
    })
    
    // 6. Verify credentials present
    const credentials = await agent.credentials.getAll()
    expect(credentials.length).toBeGreaterThan(0)
  })
})
```

### 10.3. Property-Based Tests

**Correctness Properties:**
```typescript
import fc from 'fast-check'

describe('Key Derivation Properties', () => {
  it('should be deterministic', () => {
    fc.assert(
      fc.property(fc.string(), (mnemonic) => {
        if (!validateMnemonic(mnemonic)) return true
        
        const key1 = deriveWalletKeyFromMnemonic(mnemonic)
        const key2 = deriveWalletKeyFromMnemonic(mnemonic)
        
        return key1 === key2
      })
    )
  })
  
  it('should produce unique keys for different mnemonics', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (mnemonic1, mnemonic2) => {
          if (!validateMnemonic(mnemonic1) || !validateMnemonic(mnemonic2)) return true
          if (mnemonic1 === mnemonic2) return true
          
          const key1 = deriveWalletKeyFromMnemonic(mnemonic1)
          const key2 = deriveWalletKeyFromMnemonic(mnemonic2)
          
          return key1 !== key2
        }
      )
    )
  })
})
```

## 11. UI/UX Design

### 11.1. Navigation Flow

**App Entry Points:**
```
┌─────────────────────────────────────────────────────────────┐
│                      App Launch                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    [Has Wallet?]
                    /           \
                  NO             YES
                  ↓               ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Onboarding Screen│  │  PIN/Auth Screen │
        └──────────────────┘  └──────────────────┘
                ↓                       ↓
        ┌──────────────────┐  ┌──────────────────┐
        │ Choose Action:   │  │  Daily Access    │
        │ • Create Wallet  │  │  (existing flow) │
        │ • Restore Wallet │  └──────────────────┘
        └──────────────────┘
                ↓
        [User Selection]
        /              \
    CREATE          RESTORE
      ↓                ↓
┌──────────────┐  ┌──────────────┐
│ New Wallet   │  │ Restore Flow │
│ Flow         │  │ (from backup)│
└──────────────┘  └──────────────┘
```

**Settings Menu Access:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Settings Screen                           │
├─────────────────────────────────────────────────────────────┤
│  Profile                                                     │
│  Security                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Backup & Recovery                                    │   │
│  │  • Create Backup                                     │   │
│  │  • View Recovery Phrase                              │   │
│  │  • Restore from Backup                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  Notifications                                               │
│  About                                                       │
└─────────────────────────────────────────────────────────────┘
```

### 11.2. Screen Designs

#### 11.2.1. Onboarding Welcome Screen

**Purpose:** First screen new users see, choose between create or restore

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    [App Logo]                                 │
│                                                               │
│              Welcome to [App Name]                            │
│                                                               │
│         Your Self-Sovereign Identity Wallet                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Icon: Plus]  Create New Wallet                     │    │
│  │                                                       │    │
│  │  Start fresh with a new digital identity             │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Icon: Download]  Restore Wallet                    │    │
│  │                                                       │    │
│  │  Already have a backup? Restore your wallet          │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component:**
```typescript
export const OnboardingWelcomeScreen = () => {
  const navigation = useNavigation()
  
  return (
    <View style={styles.container}>
      <Image source={AppLogo} style={styles.logo} />
      
      <Text style={styles.title}>Welcome to {APP_NAME}</Text>
      <Text style={styles.subtitle}>Your Self-Sovereign Identity Wallet</Text>
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('CreateWallet')}
      >
        <Icon name="plus-circle" size={24} />
        <View>
          <Text style={styles.buttonTitle}>Create New Wallet</Text>
          <Text style={styles.buttonSubtitle}>
            Start fresh with a new digital identity
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('RestoreWallet')}
      >
        <Icon name="download" size={24} />
        <View>
          <Text style={styles.buttonTitle}>Restore Wallet</Text>
          <Text style={styles.buttonSubtitle}>
            Already have a backup? Restore your wallet
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}
```

#### 11.2.2. Mnemonic Display Screen

**Purpose:** Show recovery phrase to user during wallet creation

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Back]                                          [Step 2/5]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Your Recovery Phrase                             │
│                                                               │
│  Write down these 12 words in order. You'll need them to     │
│  recover your wallet if you lose access.                     │
│                                                               │
│  ⚠️ IMPORTANT:                                                │
│  • Write on paper, don't screenshot                          │
│  • Store in a safe place                                     │
│  • Never share with anyone                                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. abandon    2. ability     3. able               │    │
│  │  4. about      5. above       6. absent             │    │
│  │  7. absorb     8. abstract    9. absurd             │    │
│  │  10. abuse     11. access     12. accident          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Copy to Clipboard]                                          │
│                                                               │
│  ☐ I have written down my recovery phrase                    │
│                                                               │
│  [Continue] (disabled until checkbox checked)                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component:**
```typescript
export const MnemonicDisplayScreen = ({ mnemonic, onNext }) => {
  const [confirmed, setConfirmed] = useState(false)
  const words = mnemonic.split(' ')
  
  const handleCopy = () => {
    Clipboard.setString(mnemonic)
    Toast.show('Copied to clipboard')
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Recovery Phrase</Text>
      
      <Text style={styles.description}>
        Write down these 12 words in order. You'll need them to recover 
        your wallet if you lose access.
      </Text>
      
      <View style={styles.warningBox}>
        <Icon name="alert-triangle" size={20} color="orange" />
        <View>
          <Text style={styles.warningTitle}>IMPORTANT:</Text>
          <Text>• Write on paper, don't screenshot</Text>
          <Text>• Store in a safe place</Text>
          <Text>• Never share with anyone</Text>
        </View>
      </View>
      
      <View style={styles.mnemonicGrid}>
        {words.map((word, index) => (
          <View key={index} style={styles.wordCard}>
            <Text style={styles.wordNumber}>{index + 1}.</Text>
            <Text style={styles.word}>{word}</Text>
          </View>
        ))}
      </View>
      
      <Button 
        title="Copy to Clipboard" 
        onPress={handleCopy}
        variant="outline"
      />
      
      <Checkbox
        checked={confirmed}
        onChange={setConfirmed}
        label="I have written down my recovery phrase"
      />
      
      <Button 
        title="Continue" 
        onPress={onNext}
        disabled={!confirmed}
      />
    </ScrollView>
  )
}
```

#### 11.2.3. Mnemonic Verification Screen

**Purpose:** Verify user wrote down recovery phrase correctly

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Back]                                          [Step 3/5]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Verify Recovery Phrase                           │
│                                                               │
│  Select the correct words to verify you wrote them down.     │
│                                                               │
│  What is word #3?                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [ able ]  [ about ]  [ above ]  [ absent ]         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  What is word #7?                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [ absorb ]  [ abstract ]  [ absurd ]  [ abuse ]    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  What is word #11?                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [ access ]  [ accident ]  [ account ]  [ accuse ]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Verify]                                                     │
│                                                               │
│  Attempts remaining: 3                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component:**
```typescript
export const MnemonicVerificationScreen = ({ mnemonic, onVerified }) => {
  const [attempts, setAttempts] = useState(3)
  const [selectedWords, setSelectedWords] = useState<Record<number, string>>({})
  
  // Select 3 random word positions to verify
  const [positions] = useState(() => {
    const indices = Array.from({ length: 12 }, (_, i) => i)
    return shuffle(indices).slice(0, 3).sort((a, b) => a - b)
  })
  
  const handleVerify = () => {
    const words = mnemonic.split(' ')
    const correct = positions.every(pos => 
      selectedWords[pos] === words[pos]
    )
    
    if (correct) {
      onVerified()
    } else {
      setAttempts(prev => prev - 1)
      if (attempts <= 1) {
        // Max attempts reached, go back to display
        Alert.alert(
          'Verification Failed',
          'Please review your recovery phrase again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
      } else {
        Alert.alert('Incorrect', `Please try again. ${attempts - 1} attempts remaining.`)
      }
    }
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Recovery Phrase</Text>
      <Text style={styles.description}>
        Select the correct words to verify you wrote them down.
      </Text>
      
      {positions.map(pos => (
        <View key={pos} style={styles.question}>
          <Text style={styles.questionText}>What is word #{pos + 1}?</Text>
          <View style={styles.options}>
            {generateOptions(mnemonic, pos).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  selectedWords[pos] === option && styles.selectedOption
                ]}
                onPress={() => setSelectedWords({ ...selectedWords, [pos]: option })}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      
      <Button 
        title="Verify" 
        onPress={handleVerify}
        disabled={Object.keys(selectedWords).length < 3}
      />
      
      <Text style={styles.attempts}>Attempts remaining: {attempts}</Text>
    </View>
  )
}
```

#### 11.2.4. Restore Wallet Screen (Onboarding)

**Purpose:** Restore wallet during onboarding (new device scenario)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Back]                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Restore Your Wallet                              │
│                                                               │
│  You'll need:                                                 │
│  • Your backup file (.zip)                                   │
│  • Your 12-word recovery phrase                              │
│                                                               │
│  Step 1: Select Backup File                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Icon: Folder]  Choose Backup File                  │    │
│  │                                                       │    │
│  │  No file selected                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Step 2: Enter Recovery Phrase                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Word 1:  [_________]    Word 2:  [_________]       │    │
│  │  Word 3:  [_________]    Word 4:  [_________]       │    │
│  │  Word 5:  [_________]    Word 6:  [_________]       │    │
│  │  Word 7:  [_________]    Word 8:  [_________]       │    │
│  │  Word 9:  [_________]    Word 10: [_________]       │    │
│  │  Word 11: [_________]    Word 12: [_________]       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Paste from Clipboard]                                       │
│                                                               │
│  [Restore Wallet]                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Component:**
```typescript
export const RestoreWalletOnboardingScreen = () => {
  const [backupFile, setBackupFile] = useState<string>('')
  const [mnemonic, setMnemonic] = useState<string[]>(Array(12).fill(''))
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()
  
  const handleSelectFile = async () => {
    const file = await DocumentPicker.pick({
      type: [DocumentPicker.types.zip],
    })
    setBackupFile(file.uri)
  }
  
  const handlePaste = async () => {
    const text = await Clipboard.getString()
    const words = text.trim().split(/\s+/)
    if (words.length === 12) {
      setMnemonic(words)
    } else {
      Alert.alert('Invalid Format', 'Please paste exactly 12 words')
    }
  }
  
  const handleRestore = async () => {
    try {
      setLoading(true)
      
      const mnemonicString = mnemonic.join(' ')
      
      // Validate mnemonic
      if (!validateMnemonic(mnemonicString)) {
        Alert.alert('Invalid Recovery Phrase', 'Please check your words and try again.')
        return
      }
      
      // Derive wallet key
      const walletKey = deriveWalletKeyFromMnemonic(mnemonicString)
      
      // Restore wallet
      await backupService.restoreWalletComplete(
        agent,
        backupFile,
        mnemonicString,
        { id: 'walletId', key: walletKey },
        mediatorUrl,
        (status) => {
          // Update progress
        }
      )
      
      // Navigate to PIN setup
      navigation.navigate('SetPIN', { mnemonic: mnemonicString })
    } catch (error) {
      Alert.alert('Restore Failed', error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const isValid = backupFile && mnemonic.every(w => w.length > 0)
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restore Your Wallet</Text>
      
      <Text style={styles.description}>You'll need:</Text>
      <Text>• Your backup file (.zip)</Text>
      <Text>• Your 12-word recovery phrase</Text>
      
      <Text style={styles.sectionTitle}>Step 1: Select Backup File</Text>
      <TouchableOpacity style={styles.fileButton} onPress={handleSelectFile}>
        <Icon name="folder" size={24} />
        <Text>{backupFile ? 'File selected' : 'Choose Backup File'}</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Step 2: Enter Recovery Phrase</Text>
      <MnemonicInput 
        words={mnemonic}
        onChange={setMnemonic}
      />
      
      <Button 
        title="Paste from Clipboard" 
        onPress={handlePaste}
        variant="outline"
      />
      
      <Button 
        title="Restore Wallet" 
        onPress={handleRestore}
        disabled={!isValid}
        loading={loading}
      />
    </ScrollView>
  )
}
```

#### 11.2.5. Backup Screen (Settings)

**Purpose:** Create backup from settings menu

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Back]                    Backup Wallet                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Create a backup of your wallet to restore it later on       │
│  another device.                                              │
│                                                               │
│  ⚠️ You'll need BOTH:                                         │
│  • The backup file (.zip)                                    │
│  • Your recovery phrase (12 words)                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  Last Backup: Never                                   │    │
│  │                                                       │    │
│  │  [Create Backup]                                      │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Icon: Eye]  View Recovery Phrase                   │    │
│  │                                                       │    │
│  │  View your 12-word recovery phrase                   │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Icon: Download]  Restore from Backup               │    │
│  │                                                       │    │
│  │  Replace current wallet with backup                  │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 11.3. User Journey Maps

#### 11.3.1. New User Journey (Create Wallet)

```
1. Launch App
   ↓
2. See Welcome Screen
   ↓
3. Tap "Create New Wallet"
   ↓
4. See Recovery Phrase (12 words)
   ↓
5. Write down on paper
   ↓
6. Check "I've written it down"
   ↓
7. Verify 3 random words
   ↓
8. Set PIN (6 digits)
   ↓
9. Optional: Enable biometrics
   ↓
10. Wallet created!
    ↓
11. Start using wallet

Time: ~3-5 minutes
Friction points: Writing down recovery phrase (necessary)
```

#### 11.3.2. Restore User Journey (New Device)

```
1. Launch App (new device)
   ↓
2. See Welcome Screen
   ↓
3. Tap "Restore Wallet"
   ↓
4. Select backup file from cloud/files
   ↓
5. Enter 12-word recovery phrase
   ↓
6. Wait for restore (30-60 seconds)
   ↓
7. Set new PIN
   ↓
8. Optional: Enable biometrics
   ↓
9. Wallet restored!
   ↓
10. All credentials present

Time: ~2-3 minutes
Friction points: Finding backup file, entering 12 words
```

#### 11.3.3. Existing User Journey (Migration)

```
1. Launch App (existing user)
   ↓
2. See Migration Prompt
   ↓
3. Read benefits explanation
   ↓
4. Tap "Migrate Now"
   ↓
5. Create backup (forced)
   ↓
6. See new recovery phrase
   ↓
7. Write down on paper
   ↓
8. Verify 3 random words
   ↓
9. Wait for migration (2-5 minutes)
   ↓
10. Set PIN (can be same)
    ↓
11. Migration complete!
    ↓
12. Continue using wallet

Time: ~5-10 minutes
Friction points: Writing down new recovery phrase, migration time
```

### 11.4. Component Specifications

#### 11.4.1. MnemonicInput Component

**Props:**
```typescript
interface MnemonicInputProps {
  words: string[]
  onChange: (words: string[]) => void
  autoFocus?: boolean
  showWordList?: boolean  // Show BIP39 wordlist suggestions
}
```

**Features:**
- 12 input fields in 2-column grid
- Auto-complete from BIP39 wordlist
- Validate each word against wordlist
- Paste support (split by spaces)
- Auto-focus next field on valid word
- Show checksum validation status

#### 11.4.2. MnemonicDisplay Component

**Props:**
```typescript
interface MnemonicDisplayProps {
  mnemonic: string
  title?: string
  showCopyButton?: boolean
  showWarning?: boolean
  requireConfirmation?: boolean
  onConfirmed?: () => void
}
```

**Features:**
- Display 12 words in 3x4 grid
- Number each word (1-12)
- Copy to clipboard button
- Security warnings
- Confirmation checkbox
- Blur effect until user taps "reveal"

#### 11.4.3. ProgressIndicator Component

**Props:**
```typescript
interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  status: 'pending' | 'in-progress' | 'complete' | 'error'
}
```

**Features:**
- Show all steps
- Highlight current step
- Show completion status
- Animated transitions
- Error state handling

### 11.5. Accessibility

**Screen Reader Support:**
- All buttons have descriptive labels
- Mnemonic words announced with numbers
- Progress indicators announced
- Error messages announced immediately

**Keyboard Navigation:**
- Tab order follows logical flow
- Enter key submits forms
- Escape key cancels operations
- Arrow keys navigate word grid

**Visual Accessibility:**
- High contrast mode support
- Large text support (up to 200%)
- Color-blind friendly (no color-only indicators)
- Focus indicators visible

**Localization:**
- All text translatable
- RTL language support
- Date/time formatting
- Number formatting

---

**Document Status:** ✅ Complete  
**Next Steps:** Review and implement UI components  
**Last Updated:** 2026-01-29
