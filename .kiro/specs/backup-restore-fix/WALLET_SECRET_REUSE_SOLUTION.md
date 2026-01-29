# Wallet Secret Reuse Solution

## Implemented Solution

Setelah diskusi dengan user, kami mengimplementasikan solusi yang **lebih user-friendly**: **Reuse PIN yang sudah ada** dari wallet lama, sehingga user tidak perlu input PIN baru saat restore.

## Konsep

Saat restore wallet, sistem akan:
1. Load wallet secret yang sudah ada dari keychain (berisi hashed PIN lama)
2. Gunakan hashed PIN tersebut sebagai wallet key untuk restore
3. Mnemonic hanya digunakan untuk decrypt backup file
4. Setelah restore, user tetap menggunakan PIN yang sama seperti sebelumnya

## Keuntungan

1. ✅ **User-Friendly**: User tidak perlu set PIN baru
2. ✅ **Konsisten**: User tetap pakai PIN yang sama
3. ✅ **Simple**: Hanya perlu input mnemonic, tidak perlu input PIN
4. ✅ **Secure**: Wallet secret tetap tersimpan aman di keychain
5. ✅ **No Breaking Change**: Wallet secret yang sudah ada di keychain tetap valid

## Flow Lengkap

### 1. User Memiliki Wallet Lama
```
Keychain berisi:
- id: 'walletId'
- key: hashedPIN (dari PIN user, misal "123456")
- salt: randomSalt
```

### 2. User Ingin Restore dari Backup
```
User input:
- Backup file (zip)
- Mnemonic (untuk decrypt backup)

System:
1. Load wallet secret dari keychain
2. Dapat: { id: 'walletId', key: hashedPIN, salt: randomSalt }
```

### 3. Restore Process
```typescript
// Load existing wallet secret
const walletSecret = await loadWalletSecret()

// Create wallet config with hashed PIN from keychain
const targetConfig: WalletConfig = {
  id: walletSecret.id,      // 'walletId'
  key: walletSecret.key,    // hashedPIN (NOT mnemonic!)
}

// Restore wallet
await backupService.restoreWalletComplete(
  agent,
  filePath,
  mnemonic,        // Used ONLY to decrypt backup
  targetConfig,    // Wallet config with hashedPIN
  mediatorUrl,
  onProgress
)
```

### 4. Setelah Restore
```
Wallet di-restore dengan key: hashedPIN
Keychain masih berisi: { id: 'walletId', key: hashedPIN, salt: randomSalt }
```

### 5. App Restart
```
System load wallet secret dari keychain
Dapat: { id: 'walletId', key: hashedPIN, salt: randomSalt }
Buka wallet dengan key: hashedPIN
✅ BERHASIL! Key-nya cocok!
```

## Implementasi

### File Changes

#### 1. `packages/backup/src/screens/RestoreWalletScreen.tsx`

**Added Import**:
```typescript
import { loadWalletSecret } from '../../../core/src/services/keychain'
```

**Updated handleRestore**:
```typescript
const handleRestore = async () => {
  // ... validation ...

  // Load existing wallet secret from keychain (reuse existing PIN)
  const walletSecret = await loadWalletSecret()
  
  if (!walletSecret) {
    Alert.alert('Error', 'Could not load wallet credentials.')
    return
  }

  // Use wallet secret from keychain (same PIN as before)
  const targetConfig: WalletConfig = {
    id: walletSecret.id,      // 'walletId' from keychain
    key: walletSecret.key,    // Hashed PIN from keychain (NOT mnemonic!)
  }

  // Restore with hashed PIN as wallet key
  await backupService.restoreWalletComplete(
    agent,
    filePath,
    mnemonic,        // Used only for decrypting the backup file
    targetConfig,    // Wallet config with hashed PIN from keychain
    mediatorUrl,
    onProgress
  )
}
```

#### 2. `packages/backup/src/services/BackupService.ts`

**Updated Documentation**:
```typescript
/**
 * Complete restore flow including agent reinitialize and mediator setup
 * 
 * IMPORTANT: This method uses two different keys:
 * 1. `mnemonic` - Used ONLY to decrypt the backup file
 * 2. `walletConfig.key` - Used as the wallet key (should be hashed PIN from keychain)
 * 
 * The wallet will be imported with the key from walletConfig, NOT the mnemonic.
 * This ensures the restored wallet uses the same key as the existing wallet secret in keychain.
 */
```

**Added Validation**:
```typescript
const walletKey = walletConfig.key

if (!walletKey) {
  throw new Error('Wallet key is required in walletConfig')
}
```

**Updated Import Call**:
```typescript
// Step 4: Import wallet from backup
// IMPORTANT: Use mnemonic to decrypt the backup, but walletKey (from keychain) as the wallet key
await this.importWallet(agent, normalizedPath, mnemonic, walletConfig)
```

#### 3. `packages/core/src/navigators/SettingStack.tsx`

**Added Import**:
```typescript
import { useStore } from '../contexts/store'
```

**Added Store Hook**:
```typescript
const [store] = useStore()
```

**Updated RestoreWallet Screen**:
```typescript
<Stack.Screen
  name={Screens.RestoreWallet}
  options={{
    title: 'Restore Wallet',
    headerBackTestID: testIdWithKey('Back'),
  }}
>
  {(props) => (
    <RestoreWalletScreen
      {...props}
      mediatorUrl={store.preferences.selectedMediator}
    />
  )}
</Stack.Screen>
```

## Perbedaan dengan Solusi Sebelumnya

### Solusi Lama (SALAH)
```typescript
// ❌ Menggunakan mnemonic sebagai wallet key
const targetConfig = {
  id: 'walletId',
  key: mnemonic,  // SALAH!
}
```

### Solusi Baru (BENAR)
```typescript
// ✅ Menggunakan hashed PIN dari keychain sebagai wallet key
const walletSecret = await loadWalletSecret()
const targetConfig = {
  id: walletSecret.id,
  key: walletSecret.key,  // Hashed PIN dari keychain
}
```

## Key Concepts

### Mnemonic vs Wallet Key

| Aspect | Mnemonic | Wallet Key (Hashed PIN) |
|--------|----------|-------------------------|
| **Fungsi** | Decrypt backup file | Buka wallet sehari-hari |
| **Digunakan saat** | Export/Import backup | Setiap kali buka wallet |
| **Disimpan di** | Tidak disimpan | Keychain (secure storage) |
| **Bisa berubah** | Tidak | Ya (kalau user ganti PIN) |
| **Analogi** | Kunci brankas bank | Kunci rumah sehari-hari |

### Wallet Secret Structure

```typescript
interface WalletSecret {
  id: string      // 'walletId' (constant)
  key: string     // Hashed PIN (dari secretForPIN)
  salt: string    // Random salt (untuk hash PIN)
}
```

## Testing

### Manual Testing Steps

1. **Setup**: Pastikan ada wallet dengan PIN (misal "123456")
2. **Backup**: Export wallet ke backup file
3. **Restore**: 
   - Pilih backup file
   - Input mnemonic
   - Klik "Restore Wallet"
4. **Verify**: 
   - Restore berhasil tanpa error
   - Tutup aplikasi
   - Buka aplikasi lagi
   - Input PIN "123456" (PIN lama)
   - ✅ Wallet terbuka tanpa error!

### Expected Results

- ✅ Restore berhasil
- ✅ Tidak ada error "Incorrect key for wallet"
- ✅ User bisa pakai PIN lama
- ✅ Semua credentials ada
- ✅ Mediator terkoneksi

## Security Considerations

### Keamanan Terjaga

1. **Wallet Secret Tetap Aman**: Hashed PIN tetap tersimpan di keychain (secure storage)
2. **Mnemonic Tidak Disimpan**: Mnemonic hanya digunakan saat restore, tidak disimpan
3. **PIN Tidak Berubah**: User tetap pakai PIN yang sama, tidak perlu ingat PIN baru
4. **Biometrics Tetap Berfungsi**: Jika user pakai biometrics, tetap bisa digunakan

### Separation of Concerns

- **Backup Encryption**: Menggunakan mnemonic
- **Wallet Access**: Menggunakan hashed PIN
- Kedua hal ini terpisah dan tidak saling bergantung

## Advantages Over "Set New PIN" Approach

### Solusi "Set New PIN" (Tidak Digunakan)
- ❌ User harus ingat PIN baru
- ❌ Lebih banyak input (mnemonic + PIN + confirm PIN)
- ❌ Lebih kompleks
- ❌ Risk: User lupa PIN baru

### Solusi "Reuse PIN" (Digunakan)
- ✅ User pakai PIN yang sudah diingat
- ✅ Lebih sedikit input (hanya mnemonic)
- ✅ Lebih simple
- ✅ No risk: PIN tetap sama

## Edge Cases Handled

### 1. Wallet Secret Tidak Ada di Keychain
```typescript
const walletSecret = await loadWalletSecret()

if (!walletSecret) {
  Alert.alert('Error', 'Could not load wallet credentials.')
  return
}
```

**Scenario**: User belum pernah set up wallet
**Handling**: Show error, user harus set up wallet dulu

### 2. Mnemonic Salah
```typescript
// importWallet akan throw error jika mnemonic salah
await this.importWallet(agent, normalizedPath, mnemonic, walletConfig)
```

**Scenario**: User input mnemonic yang salah
**Handling**: Show error "Incorrect mnemonic"

### 3. Backup File Corrupted
```typescript
// validateBackupFile akan throw error jika file corrupted
await this.validateBackupFile(normalizedPath)
```

**Scenario**: Backup file rusak
**Handling**: Show error "Backup file is corrupted"

## Compatibility

### Backward Compatibility
- ✅ Compatible dengan wallet yang sudah ada
- ✅ Tidak perlu migration
- ✅ Wallet secret yang sudah ada tetap valid

### Forward Compatibility
- ✅ Jika user ganti PIN nanti, tetap berfungsi
- ✅ Jika user enable/disable biometrics, tetap berfungsi

## Conclusion

Solusi ini memberikan **user experience terbaik** dengan:
1. Reuse PIN yang sudah ada (tidak perlu set PIN baru)
2. Simple flow (hanya input mnemonic)
3. Secure (wallet secret tetap di keychain)
4. Konsisten dengan PIN yang sudah diingat user

**Status**: ✅ Implemented and ready for testing
**Next Step**: Manual testing pada device Android/iOS
